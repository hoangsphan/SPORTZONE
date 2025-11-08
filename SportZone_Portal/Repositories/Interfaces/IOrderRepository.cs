using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        /// <summary>
        /// Tạo Order từ Booking
        /// </summary>
        Task<Order> CreateOrderFromBookingAsync(OrderCreateDTO orderDto);
        /// <summary>
        /// Lấy Order theo BookingId
        /// </summary>
        Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId);

        Task<OrderDTO?> UpdateOrderContentPaymentAsync(int orderId, int option);
        Task<OrderDTO?> GetOrderByIdAsync(int orderId);

        /// <summary>
        /// Lấy tổng doanh thu của chủ sân
        /// </summary>
        Task<OwnerRevenueDTO> GetOwnerTotalRevenueAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null, int? facilityId = null);

        /// <summary>
        /// Lấy thông tin chi tiết Order theo ScheduleId
        /// </summary>
        Task<OrderDetailByScheduleDTO?> GetOrderByScheduleIdAsync(int scheduleId);

        /// <summary>
        /// Lấy thông tin đơn giản (tên, điện thoại, giờ đặt, ngày đặt) theo ScheduleId
        /// </summary>
        Task<OrderSlotDetailDTO?> GetOrderSlotDetailByScheduleIdAsync(int scheduleId);
    }
}