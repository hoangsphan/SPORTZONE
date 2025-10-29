using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IOrderService
    {
        /// <summary>
        /// Tạo Order từ Booking data
        /// </summary>
        Task<OrderDTO> CreateOrderFromBookingAsync(Booking booking, int? discountId = null);

        /// <summary>
        /// Lấy Order theo ID
        /// </summary>
        Task<OrderDTO?> GetOrderByIdAsync(int orderId);

        /// <summary>
        /// Lấy Order theo BookingId
        /// </summary>
        Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId);

        Task<OrderDTO?> UpdateOrderContentPaymentAsync(int orderId, int option);
        /// <summary>
        /// Lấy tổng doanh thu của chủ sân
        /// </summary>
        Task<OwnerRevenueDTO> GetOwnerTotalRevenueAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null, int? facilityId = null);

        /// <summary>
        /// Lấy thông tin chi tiết Order theo ScheduleId
        /// </summary>
        Task<OrderDetailByScheduleDTO?> GetOrderByScheduleIdAsync(int scheduleId);

        /// <summary>
        /// Lấy thông tin đơn giản (khách + giờ/ ngày) theo ScheduleId
        /// </summary>
        Task<OrderSlotDetailDTO?> GetOrderSlotDetailByScheduleIdAsync(int scheduleId);
    }
}