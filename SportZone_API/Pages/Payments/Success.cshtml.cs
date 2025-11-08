
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SportZone_API.Pages.Payments
{
    public class SuccessModel : PageModel
    {
        [BindProperty(SupportsGet = true)]
        public string? BookingId { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Message { get; set; }

        [BindProperty(SupportsGet = true)]
        public int? HistoryUserId { get; set; }

        public string DisplayMessage => string.IsNullOrWhiteSpace(Message)
            ? "Thanh toán thành công!"
            : Message.Trim();

        public string? BookingCode => string.IsNullOrWhiteSpace(BookingId) ? null : BookingId.Trim();
    }
}
