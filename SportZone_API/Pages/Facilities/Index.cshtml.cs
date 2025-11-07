using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Pages.Facilities
{
    public class IndexModel : PageModel
    {
        private readonly IFacilityService _facilityService;
        private readonly ILogger<IndexModel> _logger;

        public IReadOnlyList<FacilityDetailDto> Facilities { get; private set; } = Array.Empty<FacilityDetailDto>();

        [BindProperty(SupportsGet = true)]
        public string? Search { get; set; }

        public string? ErrorMessage { get; private set; }

        public bool HasSearch => !string.IsNullOrWhiteSpace(Search);

        public int ResultCount => Facilities.Count;

        public IndexModel(IFacilityService facilityService, ILogger<IndexModel> logger)
        {
            _facilityService = facilityService;
            _logger = logger;
        }

        public async Task OnGetAsync()
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(Search))
                {
                    Search = Search.Trim();
                }

                var response = await _facilityService.GetAllFacilitiesWithDetails(Search);

                if (!response.Success)
                {
                    ErrorMessage = response.Message ?? "Không thể tải danh sách cơ sở.";
                    _logger.LogError("Lỗi tải cơ sở: {Message}", response.Message);
                    return;
                }

                Facilities = response.Data?
                    .Where(facility => facility is not null)
                    .ToList() ?? Array.Empty<FacilityDetailDto>();
            }
            catch (Exception exception)
            {
                ErrorMessage = "Đã xảy ra lỗi trong quá trình tải cơ sở. Vui lòng thử lại sau.";
                _logger.LogError(exception, "Lỗi không mong muốn khi tải danh sách cơ sở");
            }
        }
    }
}
