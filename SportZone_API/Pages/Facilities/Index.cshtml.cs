using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Pages.Facilities
{
    public class IndexModel : PageModel
    {
        private readonly IFacilityService _facilityService;
        private readonly ICategoryFieldService _categoryFieldService;
        private readonly ILogger<IndexModel> _logger;

        private const string DefaultSortKey = "relevance";
        private const string SortByNameKey = "name";
        private const string SortByCategoriesKey = "categories";
        private const string SortByStatusKey = "status";

        private static readonly SortOption DefaultSortOption = new(DefaultSortKey, "Mặc định", "thứ tự gợi ý");

        private static readonly SortOption[] SortOptionDefinitions =
        {
            DefaultSortOption,
            new(SortByNameKey, "Tên (A-Z)", "tên cơ sở (A-Z)"),
            new(SortByCategoriesKey, "Nhiều hạng mục", "số lượng hạng mục nhiều nhất"),
            new(SortByStatusKey, "Trạng thái mở cửa", "trạng thái mở cửa hiện tại")
        };

        public IReadOnlyList<FacilityDetailDto> Facilities { get; private set; } = Array.Empty<FacilityDetailDto>();

        public IReadOnlyList<CategoryFieldDto> CategoryOptions { get; private set; } = Array.Empty<CategoryFieldDto>();

        public IReadOnlyList<string> AddressOptions { get; private set; } = Array.Empty<string>();

        [BindProperty(SupportsGet = true)]
        public string? Search { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Category { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Address { get; set; }

        [BindProperty(SupportsGet = true)]
        public bool? OpenNow { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? SortBy { get; set; }

        public IReadOnlyList<string> AppliedFilters { get; private set; } = Array.Empty<string>();

        public string? ErrorMessage { get; private set; }

        public bool HasSearch => !string.IsNullOrWhiteSpace(Search);

        public bool HasCategoryFilter => !string.IsNullOrWhiteSpace(Category);

        public bool HasAddressFilter => !string.IsNullOrWhiteSpace(Address);

        public bool HasOpenNowFilter => OpenNow is true;

        public bool HasSort => !string.Equals(ActiveSortOption.Value, DefaultSortKey, StringComparison.OrdinalIgnoreCase);

        public int ResultCount => Facilities.Count;

        public DateTime EvaluationTimestamp { get; private set; }

        public string CurrentTimeDisplay => EvaluationTimestamp.ToString("HH:mm");

        public IReadOnlyList<SortOption> SortOptions => SortOptionDefinitions;

        public SortOption ActiveSortOption { get; private set; } = DefaultSortOption;

        public IndexModel(
            IFacilityService facilityService,
            ICategoryFieldService categoryFieldService,
            ILogger<IndexModel> logger)
        {
            _facilityService = facilityService;
            _categoryFieldService = categoryFieldService;
            _logger = logger;
        }

        public async Task OnGetAsync()
        {
            EvaluationTimestamp = DateTime.Now;
            ActiveSortOption = ResolveSortOption(SortBy);
            SortBy = ActiveSortOption.Value;
            try
            {
                Search = NormalizeQuery(Search);
                Category = NormalizeQuery(Category);
                Address = NormalizeQuery(Address);

                await LoadCategoryOptionsAsync();

                var allFacilitiesResponse = await LoadAddressOptionsAsync();
                var facilitiesResponse = await LoadFacilitiesAsync(allFacilitiesResponse);

                if (facilitiesResponse is null || !facilitiesResponse.Success)
                {
                    ErrorMessage = facilitiesResponse?.Message ?? "Không thể tải danh sách cơ sở.";
                    _logger.LogError("Lỗi tải cơ sở: {Message}", facilitiesResponse?.Message);
                    Facilities = Array.Empty<FacilityDetailDto>();
                    AppliedFilters = Array.Empty<string>();
                    return;
                }

                var facilities = facilitiesResponse.Data?
                    .Where(facility => facility is not null)
                    .ToList() ?? new List<FacilityDetailDto>();

                if (HasCategoryFilter)
                {
                    facilities = facilities
                        .Where(facility => facility.CategoryFields?.Any(category =>
                                !string.IsNullOrWhiteSpace(category?.CategoryFieldName) &&
                                string.Equals(category.CategoryFieldName.Trim(), Category, StringComparison.CurrentCultureIgnoreCase)) == true)
                        .ToList();
                }

                if (HasAddressFilter)
                {
                    facilities = facilities
                        .Where(facility => !string.IsNullOrWhiteSpace(facility.Address) &&
                                           string.Equals(facility.Address.Trim(), Address, StringComparison.CurrentCultureIgnoreCase))
                        .ToList();
                }

                if (HasOpenNowFilter)
                {
                    var evaluationTime = EvaluationTimestamp;
                    facilities = facilities
                        .Where(facility => FacilityScheduleHelper
                            .Evaluate(facility.OpenTime, facility.CloseTime, evaluationTime).IsOpen)
                        .ToList();
                }

                facilities = ApplySort(facilities, ActiveSortOption);
                Facilities = facilities;

                var appliedFilters = new List<string>();
                if (HasSearch)
                {
                    appliedFilters.Add($"từ khóa \"{Search}\"");
                }

                if (HasCategoryFilter)
                {
                    appliedFilters.Add($"hạng mục \"{Category}\"");
                }

                if (HasAddressFilter)
                {
                    appliedFilters.Add($"khu vực \"{Address}\"");
                }

                if (HasOpenNowFilter)
                {
                    appliedFilters.Add("cơ sở đang mở cửa");
                }

                if (HasSort)
                {
                    appliedFilters.Add($"sắp xếp theo {ActiveSortOption.FilterDescription}");
                }

                AppliedFilters = appliedFilters;
            }
            catch (Exception exception)
            {
                ErrorMessage = "Đã xảy ra lỗi trong quá trình tải cơ sở. Vui lòng thử lại sau.";
                _logger.LogError(exception, "Lỗi không mong muốn khi tải danh sách cơ sở");
            }
        }

        private async Task LoadCategoryOptionsAsync()
        {
            try
            {
                var response = await _categoryFieldService.GetAllCategoryFields();
                if (response.Success && response.Data is not null)
                {
                    CategoryOptions = response.Data
                        .Where(category => category is not null && !string.IsNullOrWhiteSpace(category.CategoryFieldName))
                        .Select(category => new CategoryFieldDto
                        {
                            CategoryFieldId = category!.CategoryFieldId,
                            CategoryFieldName = category.CategoryFieldName!.Trim()
                        })
                        .GroupBy(category => category.CategoryFieldName!, StringComparer.CurrentCultureIgnoreCase)
                        .Select(group => group.First())
                        .OrderBy(category => category.CategoryFieldName)
                        .ToList();
                }
                else if (!response.Success)
                {
                    _logger.LogWarning("Không thể tải danh sách hạng mục: {Message}", response.Message);
                }
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Lỗi khi tải danh sách hạng mục cơ sở");
                CategoryOptions = Array.Empty<CategoryFieldDto>();
            }
        }

        private async Task<ServiceResponse<List<FacilityDetailDto>>?> LoadAddressOptionsAsync()
        {
            try
            {
                var response = await _facilityService.GetAllFacilitiesWithDetails();
                if (response.Success && response.Data is not null)
                {
                    AddressOptions = response.Data
                        .Where(facility => facility is not null && !string.IsNullOrWhiteSpace(facility.Address))
                        .Select(facility => facility.Address!.Trim())
                        .Distinct(StringComparer.CurrentCultureIgnoreCase)
                        .OrderBy(address => address)
                        .ToList();
                }
                else if (!response.Success)
                {
                    _logger.LogWarning("Không thể tải danh sách địa chỉ cơ sở: {Message}", response.Message);
                    AddressOptions = Array.Empty<string>();
                }

                return response;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Lỗi khi tải danh sách địa chỉ cơ sở");
                AddressOptions = Array.Empty<string>();
                return null;
            }
        }

        private async Task<ServiceResponse<List<FacilityDetailDto>>?> LoadFacilitiesAsync(ServiceResponse<List<FacilityDetailDto>>? cachedResponse)
        {
            if (HasSearch)
            {
                return await _facilityService.GetAllFacilitiesWithDetails(Search);
            }

            if (cachedResponse is not null)
            {
                return cachedResponse;
            }

            return await _facilityService.GetAllFacilitiesWithDetails();
        }

        private static string? NormalizeQuery(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static SortOption ResolveSortOption(string? sortValue)
        {
            if (string.IsNullOrWhiteSpace(sortValue))
            {
                return DefaultSortOption;
            }

            var normalized = sortValue.Trim();
            return SortOptionDefinitions.FirstOrDefault(option =>
                       string.Equals(option.Value, normalized, StringComparison.OrdinalIgnoreCase))
                   ?? DefaultSortOption;
        }

        private List<FacilityDetailDto> ApplySort(List<FacilityDetailDto> facilities, SortOption sortOption)
        {
            switch (sortOption.Value)
            {
                case SortByNameKey:
                    return facilities
                        .OrderBy(facility => facility?.Name ?? string.Empty, StringComparer.CurrentCultureIgnoreCase)
                        .ThenBy(facility => facility?.Address ?? string.Empty, StringComparer.CurrentCultureIgnoreCase)
                        .ToList();
                case SortByCategoriesKey:
                    return facilities
                        .OrderByDescending(facility => facility?.CategoryFields?.Count ?? 0)
                        .ThenBy(facility => facility?.Name ?? string.Empty, StringComparer.CurrentCultureIgnoreCase)
                        .ToList();
                case SortByStatusKey:
                    var evaluationTime = EvaluationTimestamp;
                    return facilities
                        .Select(facility => new
                        {
                            Facility = facility,
                            Status = FacilityScheduleHelper.Evaluate(facility?.OpenTime, facility?.CloseTime, evaluationTime)
                        })
                        .OrderByDescending(item => item.Status.IsOpen)
                        .ThenBy(item => item.Status.NextChangeIsTomorrow ? 1 : 0)
                        .ThenBy(item => item.Status.NextChangeTime ?? TimeOnly.MaxValue)
                        .ThenBy(item => item.Facility?.Name ?? string.Empty, StringComparer.CurrentCultureIgnoreCase)
                        .Select(item => item.Facility!)
                        .ToList();
                default:
                    return facilities;
            }
        }

        public FacilityScheduleStatus GetScheduleStatus(FacilityDetailDto facility)
        {
            return FacilityScheduleHelper.Evaluate(facility.OpenTime, facility.CloseTime, EvaluationTimestamp);
        }

        public record SortOption(string Value, string Label, string FilterDescription);
    }
}
