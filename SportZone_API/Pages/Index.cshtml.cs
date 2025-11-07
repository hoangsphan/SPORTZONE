using Microsoft.AspNetCore.Mvc.RazorPages;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Linq;

namespace SportZone_API.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IFacilityService _facilityService;
        private readonly ILogger<IndexModel> _logger;

        public IReadOnlyList<FacilityDetailDto> TopFacilities { get; private set; } = Array.Empty<FacilityDetailDto>();

        public IndexModel(IFacilityService facilityService, ILogger<IndexModel> logger)
        {
            _facilityService = facilityService;
            _logger = logger;
        }

        public async Task OnGetAsync()
        {
            var response = await _facilityService.GetAllFacilitiesWithDetails();
            if (response.Success && response.Data is { Count: > 0 })
            {
                TopFacilities = response.Data.Take(6).ToList();
            }
            else if (!response.Success)
            {
                _logger.LogWarning("Không thể tải danh sách cơ sở: {Message}", response.Message);
            }
        }
    }
}
