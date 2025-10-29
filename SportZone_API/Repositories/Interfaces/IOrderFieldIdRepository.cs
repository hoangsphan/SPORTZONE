using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repository.Interfaces
{
    public interface IOrderFieldIdRepository
    {
        /// <summary>
        /// Tạo OrderFieldId
        /// </summary>
        Task<OrderFieldId> CreateOrderFieldIdAsync(OrderFieldIdCreateDTO orderFieldIdDto);

        /// <summary>
        /// Lấy OrderFieldId theo OrderId
        /// </summary>
        Task<IEnumerable<OrderFieldIdDTO>> GetOrderFieldIdsByOrderIdAsync(int orderId);

        /// <summary>
        /// Lấy OrderFieldId theo FieldId
        /// </summary>
        Task<IEnumerable<OrderFieldIdDTO>> GetOrderFieldIdsByFieldIdAsync(int fieldId);
    }
}
