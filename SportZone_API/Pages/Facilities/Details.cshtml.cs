using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Pages.Facilities
{
    public class DetailsModel : PageModel
    {
        private static readonly CultureInfo VietnameseCulture = new("vi-VN");

        private readonly IFacilityService _facilityService;
        private readonly IFieldService _fieldService;
        private readonly IServiceService _serviceService;
        private readonly IFieldPricingService _fieldPricingService;
        private readonly IRegulationFacilityService _regulationFacilityService;
        private readonly ILogger<DetailsModel> _logger;

        public DetailsModel(
            IFacilityService facilityService,
            IFieldService fieldService,
            IServiceService serviceService,
            IFieldPricingService fieldPricingService,
            IRegulationFacilityService regulationFacilityService,
            ILogger<DetailsModel> logger)
        {
            _facilityService = facilityService;
            _fieldService = fieldService;
            _serviceService = serviceService;
            _fieldPricingService = fieldPricingService;
            _regulationFacilityService = regulationFacilityService;
            _logger = logger;
        }

        public FacilityDetailDto? Facility { get; private set; }

        public IReadOnlyList<FieldResponseDTO> Fields { get; private set; } = Array.Empty<FieldResponseDTO>();

        public IReadOnlyList<ServiceDTO> Services { get; private set; } = Array.Empty<ServiceDTO>();

        public IReadOnlyList<RegulationFacilityViewModel> Regulations { get; private set; }
            = Array.Empty<RegulationFacilityViewModel>();

        public IReadOnlyDictionary<int, IReadOnlyList<FieldPricingDto>> FieldPricing { get; private set; }
            = new Dictionary<int, IReadOnlyList<FieldPricingDto>>();

        public string? ErrorMessage { get; private set; }

        public string? RegulationsErrorMessage { get; private set; }

        public bool HasFacility => Facility is not null;

        public DateTime EvaluationTimestamp { get; private set; }

        public string CurrentTimeDisplay => EvaluationTimestamp.ToString("HH:mm");

        public async Task<IActionResult> OnGetAsync(int id)
        {
            if (id <= 0)
            {
                ErrorMessage = "Cơ sở không hợp lệ.";
                Response.StatusCode = StatusCodes.Status400BadRequest;
                return Page();
            }

            EvaluationTimestamp = DateTime.Now;
            try
            {
                var facilityResponse = await _facilityService.GetFacilityDetailsAsync(id);
                if (!facilityResponse.Success)
                {
                    ErrorMessage = facilityResponse.Message ?? "Không thể tải thông tin cơ sở.";
                    Response.StatusCode = StatusCodes.Status500InternalServerError;
                    _logger.LogError("Không thể tải cơ sở {FacilityId}: {Message}", id, facilityResponse.Message);
                    return Page();
                }

                if (facilityResponse.Data is null)
                {
                    ErrorMessage = facilityResponse.Message ?? "Không tìm thấy cơ sở theo yêu cầu.";
                    Response.StatusCode = StatusCodes.Status404NotFound;
                    return Page();
                }

                Facility = facilityResponse.Data;

                var fields = await _fieldService.GetFieldsByFacilityAsync(id);
                Fields = fields
                    .Where(field => field is not null)
                    .OrderBy(field => field.FieldName)
                    .ToList();

                var services = await _serviceService.GetServicesByFacilityIdAsync(id);
                Services = services
                    .Where(service => service is not null && !string.IsNullOrWhiteSpace(service.ServiceName))
                    .OrderBy(service => service.ServiceName)
                    .ToList();

                if (Fields.Any())
                {
                    await LoadFieldPricingAsync();
                }

                await LoadRegulationsAsync(id);

                return Page();
            }
            catch (Exception exception)
            {
                ErrorMessage = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.";
                Response.StatusCode = StatusCodes.Status500InternalServerError;
                _logger.LogError(exception, "Lỗi khi tải chi tiết cơ sở {FacilityId}", id);
                return Page();
            }
        }

        private async Task LoadFieldPricingAsync()
        {
            var fieldIds = Fields
                .Select(field => field.FieldId)
                .Where(fieldId => fieldId > 0)
                .ToHashSet();

            if (fieldIds.Count == 0)
            {
                FieldPricing = new Dictionary<int, IReadOnlyList<FieldPricingDto>>();
                return;
            }

            var pricingByField = new Dictionary<int, List<FieldPricingDto>>();
            var allPricing = await _fieldPricingService.GetAllFieldPricingsAsync();

            foreach (var pricing in allPricing)
            {
                if (pricing is null || !fieldIds.Contains(pricing.FieldId))
                {
                    continue;
                }

                if (!pricingByField.TryGetValue(pricing.FieldId, out var pricingList))
                {
                    pricingList = new List<FieldPricingDto>();
                    pricingByField.Add(pricing.FieldId, pricingList);
                }

                pricingList.Add(pricing);
            }

            FieldPricing = pricingByField
                .ToDictionary(
                    pair => pair.Key,
                    pair => (IReadOnlyList<FieldPricingDto>)pair.Value
                        .OrderBy(slot => slot.StartTime)
                        .ThenBy(slot => slot.EndTime)
                        .ToList());
        }

        public IReadOnlyList<FieldPricingDto> GetPricingForField(int fieldId)
        {
            return FieldPricing.TryGetValue(fieldId, out var pricing)
                ? pricing
                : Array.Empty<FieldPricingDto>();
        }

        public string FormatCurrency(decimal? value)
        {
            return value.HasValue
                ? string.Format(VietnameseCulture, "{0:C0}", value.Value)
                : "--";
        }

        public FacilityScheduleStatus GetFacilityScheduleStatus()
        {
            return FacilityScheduleHelper.Evaluate(Facility?.OpenTime, Facility?.CloseTime, EvaluationTimestamp);
        }

        public string FormatTimestamp(DateTime? value)
        {
            return value.HasValue
                ? value.Value.ToString("HH:mm 'ngày' dd/MM/yyyy", VietnameseCulture)
                : string.Empty;
        }

        private async Task LoadRegulationsAsync(int facilityId)
        {
            try
            {
                var regulations = await _regulationFacilityService.GetRegulationFacilitiesByFacilityId(facilityId);

                Regulations = (regulations ?? Enumerable.Empty<RegulationFacility>())
                    .Where(regulation => regulation is not null && !string.IsNullOrWhiteSpace(regulation.Title))
                    .Select(CreateRegulationViewModel)
                    .OrderByDescending(regulation => regulation.LastUpdatedAt ?? DateTime.MinValue)
                    .ThenBy(regulation => regulation.Title)
                    .ToList();

                RegulationsErrorMessage = null;
            }
            catch (Exception exception)
            {
                Regulations = Array.Empty<RegulationFacilityViewModel>();
                RegulationsErrorMessage = "Không thể tải quy định của cơ sở lúc này.";
                _logger.LogWarning(exception, "Không thể tải quy định cho cơ sở {FacilityId}", facilityId);
            }
        }

        private static RegulationFacilityViewModel CreateRegulationViewModel(RegulationFacility regulation)
        {
            var (statusLabel, statusClass) = GetStatusMetadata(regulation.Status);
            return new RegulationFacilityViewModel(
                regulation.Title,
                regulation.Description,
                statusLabel,
                statusClass,
                regulation.CreateAt,
                regulation.UpdateAt);
        }

        private static (string Label, string CssClass) GetStatusMetadata(string? status)
        {
            var normalized = status?.Trim().ToLowerInvariant();
            return normalized switch
            {
                "active" or "enabled" or "enable" => ("Đang áp dụng", "badge-soft-success"),
                "inactive" or "disabled" or "disable" => ("Tạm ngưng", "badge-soft-secondary"),
                "pending" or "awaiting" => ("Chờ áp dụng", "badge-soft-info"),
                "draft" => ("Bản nháp", "badge-soft-warning"),
                "archived" => ("Đã lưu trữ", "badge-soft-neutral"),
                _ => ("Đang cập nhật", "badge-soft-secondary")
            };
        }

        public sealed record RegulationFacilityViewModel(
            string Title,
            string? Description,
            string StatusLabel,
            string StatusCssClass,
            DateTime? CreatedAt,
            DateTime? UpdatedAt)
        {
            public DateTime? LastUpdatedAt => UpdatedAt ?? CreatedAt;
        }
    }
}
