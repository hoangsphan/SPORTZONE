using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repository.Interfaces
{
    public interface IBookingRepository
    {
        /// <summary>
        /// Tạo booking mới
        /// </summary>
        Task<Booking> CreateBookingAsync(BookingCreateDTO bookingDto, string? statusPayment = null);
        /// <summary>
        /// Lấy booking theo ID
        /// </summary>
        Task<BookingDetailDTO?> GetBookingByIdAsync(int bookingId);
        /// <summary>
        /// Lấy tất cả các slot đã được book cho một booking
        /// </summary>
        Task<IEnumerable<FieldBookingSchedule>> GetBookedSlotsByBookingIdAsync(int bookingId);
        /// <summary>
        /// Kiểm tra slot thời gian có khả dụng không
        /// </summary>
        Task<bool> CheckTimeSlotAvailabilityAsync(int fieldId, DateOnly date, TimeOnly startTime, TimeOnly endTime);
        /// <summary>
        /// Hủy booking
        /// </summary>
        Task<bool> CancelBookingAsync(int bookingId);

        /// <summary>
        /// Xóa hoàn toàn booking khỏi database
        /// </summary>
        Task<bool> DeleteBookingAsync(int bookingId);
        /// <summary>
        /// Lấy booking đơn giản theo ID
        /// </summary>
        Task<Booking?> GetBookingEntityByIdAsync(int bookingId);
        /// <summary>
        /// Lấy booking theo customer
        /// </summary>
        Task<IEnumerable<BookingResponseDTO>> GetBookingsByUserAsync(int userId);

        /// <summary>
        /// Validate slots có available không và thuộc cùng facility/date không
        /// </summary>
        Task<(bool IsValid, string ErrorMessage)> ValidateSelectedSlotsAsync(List<int> selectedSlotIds, int? fieldId = null, int? facilityId = null);

        /// <summary>
        /// Lấy FieldBookingSchedule theo ID
        /// </summary>
        Task<FieldBookingSchedule?> GetFieldBookingScheduleByIdAsync(int scheduleId);

        /// <summary>
        /// Lấy Service theo ID
        /// </summary>
        Task<Service?> GetServiceByIdAsync(int serviceId);

        /// <summary>
        /// Lấy Discount theo ID
        /// </summary>
        Task<Discount?> GetDiscountByIdAsync(int discountId);

        /// <summary>
        /// Cập nhật booking
        /// </summary>
        Task<bool> UpdateBookingAsync(Booking booking);

    }

}
