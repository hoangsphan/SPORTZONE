
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Pages.Bookings
{
    public class HistoryModel : PageModel
    {
        private static readonly string[] DefaultBookingStatuses = { "Pending", "Confirmed", "Completed", "Cancelled" };
        private static readonly string[] DefaultPaymentStatuses = { "Pending", "Success", "Failed", "Paid", "Refunded" };

        private readonly IBookingService _bookingService;
        private readonly ILogger<HistoryModel> _logger;

        public HistoryModel(IBookingService bookingService, ILogger<HistoryModel> logger)
        {
            _bookingService = bookingService;
            _logger = logger;
        }

        [BindProperty(SupportsGet = true)]
        public int? UserId { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Status { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? PaymentStatus { get; set; }

        [BindProperty(SupportsGet = true)]
        public DateOnly? From { get; set; }

        [BindProperty(SupportsGet = true)]
        public DateOnly? To { get; set; }

        public IReadOnlyList<BookingResponseDTO> Bookings { get; private set; } = Array.Empty<BookingResponseDTO>();

        public IReadOnlyList<string> StatusOptions { get; private set; } = BuildOptions(DefaultBookingStatuses, Array.Empty<string?>());

        public IReadOnlyList<string> PaymentStatusOptions { get; private set; } = BuildOptions(DefaultPaymentStatuses, Array.Empty<string?>());

        public IReadOnlyDictionary<string, int> StatusBreakdown { get; private set; } = new Dictionary<string, int>(StringComparer.CurrentCultureIgnoreCase);

        public IReadOnlyDictionary<string, int> PaymentBreakdown { get; private set; } = new Dictionary<string, int>(StringComparer.CurrentCultureIgnoreCase);

        public IReadOnlyList<BookingResponseDTO> UpcomingBookings { get; private set; } = Array.Empty<BookingResponseDTO>();

        public decimal TotalAmount { get; private set; }

        public decimal TotalPaidAmount { get; private set; }

        public decimal TotalUnpaidAmount { get; private set; }

        public string? ErrorMessage { get; private set; }

        public bool HasUserSelection => UserId.HasValue && UserId.Value > 0;

        public bool HasResults => Bookings.Count > 0;

        public bool HasFilters =>
            !string.IsNullOrWhiteSpace(Status) ||
            !string.IsNullOrWhiteSpace(PaymentStatus) ||
            From.HasValue ||
            To.HasValue;

        public int ResultCount => Bookings.Count;

        public async Task OnGetAsync()
        {
            if (!UserId.HasValue)
            {
                return;
            }

            if (UserId.Value <= 0)
            {
                ErrorMessage = "ID người dùng phải lớn hơn 0.";
                return;
            }

            try
            {
                var response = await _bookingService.GetUserBookingsAsync(UserId.Value);
                var allBookings = response?
                    .Where(booking => booking is not null)
                    .Select(booking => booking!)
                    .ToList() ?? new List<BookingResponseDTO>();

                StatusOptions = BuildOptions(DefaultBookingStatuses, allBookings.Select(booking => booking.Status));
                PaymentStatusOptions = BuildOptions(DefaultPaymentStatuses, allBookings.Select(booking => booking.StatusPayment));

                var filtered = ApplyFilters(allBookings);

                Bookings = filtered
                    .OrderByDescending(booking => booking.Date ?? DateOnly.MinValue)
                    .ThenByDescending(booking => booking.StartTime ?? TimeOnly.MinValue)
                    .ThenByDescending(booking => booking.CreateAt ?? DateTime.MinValue)
                    .ToList();

                StatusBreakdown = BuildBreakdown(Bookings.Select(booking => booking.Status));
                PaymentBreakdown = BuildBreakdown(Bookings.Select(booking => booking.StatusPayment));

                TotalAmount = Bookings.Sum(booking => booking.TotalAmount ?? 0m);
                TotalPaidAmount = Bookings
                    .Where(booking => IsPaymentSuccessful(booking.StatusPayment))
                    .Sum(booking => booking.TotalAmount ?? 0m);
                TotalUnpaidAmount = TotalAmount - TotalPaidAmount;

                UpcomingBookings = Bookings
                    .Where(booking => booking.Date is not null && booking.Date.Value >= DateOnly.FromDateTime(DateTime.Today))
                    .OrderBy(booking => booking.Date)
                    .ThenBy(booking => booking.StartTime)
                    .Take(3)
                    .ToList();
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Không thể tải lịch sử đặt sân cho người dùng {UserId}", UserId);
                ErrorMessage = "Không thể tải lịch sử đặt sân. Vui lòng thử lại sau.";
                Bookings = Array.Empty<BookingResponseDTO>();
            }
        }

        public string GetBookingStatusBadgeClass(string? status)
        {
            return NormalizeStatus(status).ToLowerInvariant() switch
            {
                "confirmed" or "completed" or "success" => "badge-soft-success",
                "pending" or "processing" or "awaiting" => "badge-soft-warning",
                "cancelled" or "canceled" or "failed" => "badge-soft-danger",
                _ => "badge-soft-secondary"
            };
        }

        public string GetPaymentStatusBadgeClass(string? status)
        {
            return NormalizeStatus(status).ToLowerInvariant() switch
            {
                "paid" or "success" or "completed" => "badge-soft-success",
                "pending" or "processing" or "awaiting" => "badge-soft-warning",
                "failed" or "cancelled" or "canceled" or "refunded" => "badge-soft-danger",
                _ => "badge-soft-secondary"
            };
        }

        public string GetStatusLabel(string? status)
        {
            return string.IsNullOrWhiteSpace(status) ? "Chưa cập nhật" : status.Trim();
        }

        public string FormatCurrency(decimal? amount)
        {
            if (!amount.HasValue)
            {
                return "—";
            }

            return string.Format(CultureInfo.GetCultureInfo("vi-VN"), "{0:C0}", amount.Value);
        }

        public string FormatDate(DateOnly? date)
        {
            return date?.ToString("dd/MM/yyyy", CultureInfo.CurrentCulture) ?? "Đang cập nhật";
        }

        public string FormatTimeRange(TimeOnly? start, TimeOnly? end)
        {
            if (start is null || end is null)
            {
                return "--:--";
            }

            var formattedStart = start.Value.ToString("HH:mm", CultureInfo.InvariantCulture);
            var formattedEnd = end.Value.ToString("HH:mm", CultureInfo.InvariantCulture);
            return $"{formattedStart} - {formattedEnd}";
        }

        public string FormatDateTime(DateTime? value)
        {
            return value?.ToString("dd/MM/yyyy HH:mm", CultureInfo.CurrentCulture) ?? "—";
        }

        public string GetBookingTitle(BookingResponseDTO booking)
        {
            if (!string.IsNullOrWhiteSpace(booking.Title))
            {
                return booking.Title.Trim();
            }

            if (!string.IsNullOrWhiteSpace(booking.FieldName))
            {
                return booking.FieldName.Trim();
            }

            return $"Booking #{booking.BookingId}";
        }

        public string GetFacilityLine(BookingResponseDTO booking)
        {
            var name = string.IsNullOrWhiteSpace(booking.FacilityName) ? null : booking.FacilityName.Trim();
            var address = string.IsNullOrWhiteSpace(booking.FacilityAddress) ? null : booking.FacilityAddress.Trim();

            if (name is null && address is null)
            {
                return "Cơ sở đang cập nhật";
            }

            if (name is not null && address is not null)
            {
                return $"{name} • {address}";
            }

            return name ?? address ?? string.Empty;
        }

        public bool IsStatusSelected(string option)
        {
            return !string.IsNullOrWhiteSpace(Status) &&
                   string.Equals(NormalizeStatus(option), NormalizeStatus(Status), StringComparison.OrdinalIgnoreCase);
        }

        public bool IsPaymentStatusSelected(string option)
        {
            return !string.IsNullOrWhiteSpace(PaymentStatus) &&
                   string.Equals(NormalizeStatus(option), NormalizeStatus(PaymentStatus), StringComparison.OrdinalIgnoreCase);
        }

        public bool HasStatusBreakdown => StatusBreakdown.Count > 0;

        public bool HasPaymentBreakdown => PaymentBreakdown.Count > 0;

        public bool HasUpcomingBookings => UpcomingBookings.Count > 0;

        private List<BookingResponseDTO> ApplyFilters(List<BookingResponseDTO> source)
        {
            var filtered = source;

            if (!string.IsNullOrWhiteSpace(Status))
            {
                var normalizedStatus = NormalizeStatus(Status);
                filtered = filtered
                    .Where(booking => string.Equals(NormalizeStatus(booking.Status), normalizedStatus, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(PaymentStatus))
            {
                var normalizedPaymentStatus = NormalizeStatus(PaymentStatus);
                filtered = filtered
                    .Where(booking => string.Equals(NormalizeStatus(booking.StatusPayment), normalizedPaymentStatus, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (From.HasValue)
            {
                filtered = filtered
                    .Where(booking => booking.Date is null || booking.Date.Value >= From.Value)
                    .ToList();
            }

            if (To.HasValue)
            {
                filtered = filtered
                    .Where(booking => booking.Date is null || booking.Date.Value <= To.Value)
                    .ToList();
            }

            return filtered;
        }

        private static IReadOnlyList<string> BuildOptions(IEnumerable<string> defaults, IEnumerable<string?> dynamicValues)
        {
            var comparer = StringComparer.CurrentCultureIgnoreCase;
            var seen = new HashSet<string>(comparer);
            var results = new List<string>();

            foreach (var option in defaults)
            {
                var normalized = NormalizeStatus(option);
                if (string.IsNullOrEmpty(normalized) || !seen.Add(normalized))
                {
                    continue;
                }

                results.Add(option.Trim());
            }

            foreach (var value in dynamicValues)
            {
                var normalized = NormalizeStatus(value);
                if (string.IsNullOrEmpty(normalized) || !seen.Add(normalized))
                {
                    continue;
                }

                results.Add(value!.Trim());
            }

            return results
                .OrderBy(option => option, comparer)
                .ToList();
        }

        private static IReadOnlyDictionary<string, int> BuildBreakdown(IEnumerable<string?> statuses)
        {
            var breakdown = new Dictionary<string, int>(StringComparer.CurrentCultureIgnoreCase);

            foreach (var status in statuses)
            {
                var label = string.IsNullOrWhiteSpace(status) ? "Chưa cập nhật" : status.Trim();
                breakdown[label] = breakdown.TryGetValue(label, out var count) ? count + 1 : 1;
            }

            return breakdown
                .OrderByDescending(pair => pair.Value)
                .ThenBy(pair => pair.Key, StringComparer.CurrentCultureIgnoreCase)
                .ToDictionary(pair => pair.Key, pair => pair.Value, StringComparer.CurrentCultureIgnoreCase);
        }

        private static bool IsPaymentSuccessful(string? status)
        {
            return NormalizeStatus(status).ToLowerInvariant() is "paid" or "success" or "completed";
        }

        private static string NormalizeStatus(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();
        }
    }
}
