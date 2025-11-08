using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IBookingService
    {
        /// <summary>
        /// Tạo booking mới (customer hoặc guest)
        /// </summary>
        Task<BookingDetailDTO> CreateBookingAsync(BookingCreateDTO bookingDto);

        /// <summary>
        /// Lấy chi tiết booking theo ID
        /// </summary>
        Task<BookingDetailDTO?> GetBookingDetailAsync(int bookingId);

        /// <summary>
        /// Hủy booking
        /// </summary>
        Task<bool> CancelBookingAsync(int bookingId);

        /// <summary>
        /// Lấy danh sách booking theo customer
        /// </summary>
        Task<IEnumerable<BookingResponseDTO>> GetUserBookingsAsync(int userId);
        /// <summary>
        /// Validate booking business rules
        /// </summary>
        Task<(bool IsValid, string ErrorMessage)> ValidateBookingRulesAsync(BookingCreateDTO bookingDto);

        /// <summary>
        /// Kiểm tra slot thời gian có trống không với Date và Time riêng biệt
        /// </summary>
        Task<bool> CheckTimeSlotAvailabilityAsync(int fieldId, DateOnly date, TimeOnly startTime, TimeOnly endTime);

        /// <summary>
        /// Tính toán tổng tiền cho booking
        /// </summary>
        Task<ServiceResponse<decimal>> CalculateTotalAmount(CalculateAmountDTO calculateDto);

        /// <summary>
        /// Tạo booking tạm thời với status Pending cho thanh toán
        /// </summary>
        Task<ServiceResponse<BookingDetailDTO>> CreatePendingBookingAsync(BookingCreateDTO bookingDto, string orderId);

        /// <summary>
        /// Xác nhận booking sau khi thanh toán thành công
        /// </summary>
        Task<bool> ConfirmBookingAsync(int bookingId);

        /// <summary>
        /// Xóa booking pending và giải phóng slot
        /// </summary>
        Task<bool> CancelPendingBookingAsync(int bookingId);

        /// <summary>
        /// Xóa các booking pending hết hạn (được gọi bởi background service)
        /// </summary>
        Task CleanupExpiredPendingBookingsAsync();

        /// <summary>
        /// Lấy danh sách pending bookings (để debug)
        /// </summary>
        Task<List<PendingBookingDto>> GetPendingBookingsAsync();

    }
}
