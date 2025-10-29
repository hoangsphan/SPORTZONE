using SportZone_API.Models;
using SportZone_API.DTOs;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IOrderServiceRepository
    {
        /// <summary>
        /// Tạo OrderService mới
        /// </summary>
        Task<OrderServiceDTO> CreateOrderServiceAsync(OrderServiceCreateDTO orderServiceDto);
        /// <summary>
        /// Lấy OrderService theo ID
        /// </summary>
        Task<OrderServiceDTO?> GetOrderServiceByIdAsync(int orderServiceId);
        /// <summary>
        /// Lấy tất cả OrderService theo Order ID
        /// </summary>
        Task<IEnumerable<OrderServiceDTO>> GetOrderServicesByOrderIdAsync(int orderId);
        /// <summary>
        /// Cập nhật OrderService
        /// </summary>
        Task<OrderServiceDTO?> UpdateOrderServiceAsync(int orderServiceId, OrderServiceUpdateDTO updateDto);
        /// <summary>
        /// Xóa OrderService
        /// </summary>
        Task<bool> DeleteOrderServiceAsync(int orderServiceId);
        /// <summary>
        /// Tính tổng tiền service của Order
        /// </summary>
        Task<decimal> CalculateTotalServicePriceAsync(int orderId);

        /// <summary>
        /// Cập nhật tổng tiền service vào Order
        /// </summary>
        Task<bool> UpdateOrderTotalServicePriceAsync(int orderId, decimal totalServicePrice);
    }
}
