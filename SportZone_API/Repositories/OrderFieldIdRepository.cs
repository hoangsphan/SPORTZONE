using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repository.Interfaces;

namespace SportZone_API.Repository
{
    public class OrderFieldIdRepository : IOrderFieldIdRepository
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper;

        public OrderFieldIdRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OrderFieldId> CreateOrderFieldIdAsync(OrderFieldIdCreateDTO orderFieldIdDto)
        {
            try
            {
                var orderFieldId = _mapper.Map<OrderFieldId>(orderFieldIdDto);

                _context.OrderFieldIds.Add(orderFieldId);
                await _context.SaveChangesAsync();

                return orderFieldId;
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
                var orderFieldIds = await _context.OrderFieldIds
                    .Include(ofi => ofi.Field)
                    .Include(ofi => ofi.Order)
                    .Where(ofi => ofi.OrderId == orderId)
                    .ToListAsync();

                return _mapper.Map<IEnumerable<OrderFieldIdDTO>>(orderFieldIds);
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
                var orderFieldIds = await _context.OrderFieldIds
                    .Include(ofi => ofi.Field)
                    .Include(ofi => ofi.Order)
                    .Where(ofi => ofi.FieldId == fieldId)
                    .ToListAsync();

                return _mapper.Map<IEnumerable<OrderFieldIdDTO>>(orderFieldIds);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy OrderFieldIds theo FieldId: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteOrderFieldIdAsync(int orderFieldId)
        {
            try
            {
                var orderFieldIdEntity = await _context.OrderFieldIds.FindAsync(orderFieldId);
                if (orderFieldIdEntity == null) return false;

                _context.OrderFieldIds.Remove(orderFieldIdEntity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa OrderFieldId: {ex.Message}", ex);
            }
        }
    }
}
