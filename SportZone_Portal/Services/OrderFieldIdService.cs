using SportZone_API.DTOs;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class OrderFieldIdService : IOrderFieldIdService
    {
        private readonly IOrderFieldIdRepository _orderFieldIdRepository;

        public OrderFieldIdService(IOrderFieldIdRepository orderFieldIdRepository)
        {
            _orderFieldIdRepository = orderFieldIdRepository;
        }

        public async Task<OrderFieldIdDTO> CreateOrderFieldIdAsync(int orderId, int fieldId)
        {
            try
            {
                var orderFieldIdCreateDto = new OrderFieldIdCreateDTO
                {
                    OrderId = orderId,
                    FieldId = fieldId
                };

                var orderFieldId = await _orderFieldIdRepository.CreateOrderFieldIdAsync(orderFieldIdCreateDto);

                // Lấy thông tin OrderFieldId vừa tạo
                var orderFieldIds = await _orderFieldIdRepository.GetOrderFieldIdsByOrderIdAsync(orderId);
                var createdOrderFieldId = orderFieldIds.FirstOrDefault(ofi => ofi.FieldId == fieldId);

                return createdOrderFieldId ?? throw new Exception("Không thể lấy thông tin OrderFieldId vừa tạo");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo OrderFieldId: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<OrderFieldIdDTO>> GetOrderFieldIdsByOrderIdAsync(int orderId)
        {
            try
            {
                return await _orderFieldIdRepository.GetOrderFieldIdsByOrderIdAsync(orderId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy OrderFieldIds theo OrderId: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<OrderFieldIdDTO>> GetOrderFieldIdsByFieldIdAsync(int fieldId)
        {
            try
            {
                return await _orderFieldIdRepository.GetOrderFieldIdsByFieldIdAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy OrderFieldIds theo FieldId: {ex.Message}", ex);
            }
        }
    }
}
