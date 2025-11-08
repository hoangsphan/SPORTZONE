
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SportZone_API.Pages.Payments
{
    public class FailedModel : PageModel
    {
        [BindProperty(SupportsGet = true)]
        public string? Error { get; set; }

        [BindProperty(SupportsGet = true)]
        public int? HistoryUserId { get; set; }

        public string DisplayError => string.IsNullOrWhiteSpace(Error)
            ? "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ."
            : Error.Trim();
    }
}
