using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IFacilityService _facilityService;
        private readonly ILogger<IndexModel> _logger;

        public IReadOnlyList<FacilityDetailDto> TopFacilities { get; private set; } = Array.Empty<FacilityDetailDto>();

        public string? ErrorMessage { get; private set; }

        public IndexModel(IFacilityService facilityService, ILogger<IndexModel> logger)
        {
            _facilityService = facilityService;
            _logger = logger;
        }

        public async Task OnGetAsync()
        {
            try
            {
                var response = await _facilityService.GetAllFacilitiesWithDetails();

                if (response.Success && response.Data is { Count: > 0 })
                {
                    TopFacilities = response.Data
                        .Where(facility => facility is not null)
                        .Take(6)
                        .ToList();
                }
                else if (!response.Success)
                {
                    ErrorMessage = response.Message ?? "Không thể tải danh sách cơ sở vào lúc này.";
                    _logger.LogWarning("Không thể tải danh sách cơ sở: {Message}", response.Message);
                }
            }
            catch (Exception exception)
            {
                ErrorMessage = "Đã xảy ra lỗi trong quá trình tải dữ liệu. Vui lòng thử lại sau.";
                _logger.LogError(exception, "Lỗi không mong muốn khi tải trang chủ");
            }
        }
    }
}
