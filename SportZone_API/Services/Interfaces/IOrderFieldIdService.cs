using SportZone_API.DTOs;

namespace SportZone_API.Repository.Interfaces
{
    public interface IOrderFieldIdService
    {
        /// <summary>
        /// Tạo OrderFieldId từ Order và FieldId
        /// </summary>
        Task<OrderFieldIdDTO> CreateOrderFieldIdAsync(int orderId, int fieldId);

        /// <summary>
        /// Lấy OrderFieldIds theo OrderId
        /// </summary>
        Task<IEnumerable<OrderFieldIdDTO>> GetOrderFieldIdsByOrderIdAsync(int orderId);

        /// <summary>
        /// Lấy OrderFieldIds theo FieldId
        /// </summary>
        Task<IEnumerable<OrderFieldIdDTO>> GetOrderFieldIdsByFieldIdAsync(int fieldId);
    }
}
