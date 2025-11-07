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

        public IReadOnlyList<FacilityDetailDto> Facilities { get; private set; } = Array.Empty<FacilityDetailDto>();

        public IReadOnlyList<CategoryFieldDto> CategoryOptions { get; private set; } = Array.Empty<CategoryFieldDto>();

        public IReadOnlyList<string> AddressOptions { get; private set; } = Array.Empty<string>();

        [BindProperty(SupportsGet = true)]
        public string? Search { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Category { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Address { get; set; }

        public IReadOnlyList<string> AppliedFilters { get; private set; } = Array.Empty<string>();

        public string? ErrorMessage { get; private set; }

        public bool HasSearch => !string.IsNullOrWhiteSpace(Search);

        public bool HasCategoryFilter => !string.IsNullOrWhiteSpace(Category);

        public bool HasAddressFilter => !string.IsNullOrWhiteSpace(Address);

        public int ResultCount => Facilities.Count;

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
    }
}
