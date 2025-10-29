using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repository.Interfaces;
using AutoMapper;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class OrderServiceRepository : IOrderServiceRepository
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper;
        public OrderServiceRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<OrderServiceDTO> CreateOrderServiceAsync(OrderServiceCreateDTO orderServiceDto)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderServiceDto.OrderId);
                if (order == null)
                {
                    throw new ArgumentException($"Order với ID {orderServiceDto.OrderId} không tồn tại.");
                }

                var service = await _context.Services.FindAsync(orderServiceDto.ServiceId);
                if (service == null)
                {
                    throw new ArgumentException($"Service với ID {orderServiceDto.ServiceId} không tồn tại.");
                }

                var orderService = new OrderService
                {
                    OrderId = orderServiceDto.OrderId,
                    ServiceId = orderServiceDto.ServiceId,
                    Quantity = orderServiceDto.Quantity,
                    Price = service.Price
                };

                _context.OrderServices.Add(orderService);
                await _context.SaveChangesAsync();

                var totalServicePrice = await CalculateTotalServicePriceAsync(orderServiceDto.OrderId);
                await UpdateOrderTotalServicePriceAsync(orderServiceDto.OrderId, totalServicePrice);

                var createdOrdesService = await _context.OrderServices
                    .Include(os => os.Service)
                    .FirstOrDefaultAsync(os => os.OrderServiceId == orderService.OrderServiceId);

                return _mapper.Map<OrderServiceDTO>(createdOrdesService);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo OrderService: {ex.Message}", ex);
            }
        }

        public async Task<OrderServiceDTO?> GetOrderServiceByIdAsync(int orderServiceId)
        {
            try
            {
                var orderService = await _context.OrderServices
                    .Include(os => os.Service)
                    .FirstOrDefaultAsync(os => os.OrderServiceId == orderServiceId);

                return orderService != null ? _mapper.Map<OrderServiceDTO>(orderService) : null;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy OrderService: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<OrderServiceDTO>> GetOrderServicesByOrderIdAsync(int orderId)
        {
            try
            {
                var orderServices = await _context.OrderServices
                    .Include(os => os.Service)
                    .Where(os => os.OrderId == orderId)
                    .ToListAsync();
                return _mapper.Map<IEnumerable<OrderServiceDTO>>(orderServices);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách OrderService cho OrderId {orderId}: {ex.Message}", ex);
            }
        }

        public async Task<OrderServiceDTO?> UpdateOrderServiceAsync(int orderServiceId,OrderServiceUpdateDTO updateDto)
        {
            try
            {
                var orderService = await _context.OrderServices
                    .Include(os => os.Service)
                    .FirstOrDefaultAsync(os => os.OrderServiceId == orderServiceId);
                if (orderService == null)
                    return null;
                if (updateDto.Quantity.HasValue)
                {
                    orderService.Quantity = updateDto.Quantity.Value;
                }
                _context.OrderServices.Update(orderService);
                await _context.SaveChangesAsync();

                if (orderService.OrderId.HasValue)
                {
                    var totalServicePrice = await CalculateTotalServicePriceAsync(orderService.OrderId.Value);
                    await UpdateOrderTotalServicePriceAsync(orderService.OrderId.Value, totalServicePrice);
                }
                return _mapper.Map<OrderServiceDTO>(orderService);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật OrderService: {ex.Message}", ex);
            }
        } 

        public async Task<bool> DeleteOrderServiceAsync(int orderServiceId)
        {
            try
            {
                var orderService = await _context.OrderServices.FindAsync(orderServiceId);
                if (orderService == null)
                    return false;

                var orderId = orderService.OrderId; // Lưu OrderId trước khi xóa

                _context.OrderServices.Remove(orderService);
                await _context.SaveChangesAsync();

                // Tính lại tổng tiền service và update Order
                if (orderId.HasValue)
                {
                    var totalServicePrice = await CalculateTotalServicePriceAsync(orderId.Value);
                    await UpdateOrderTotalServicePriceAsync(orderId.Value, totalServicePrice);
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa OrderService: {ex.Message}", ex);
            }
        }

        public async Task<decimal> CalculateTotalServicePriceAsync(int orderId)
        {
            try
            {
                var orderServices = await _context.OrderServices
                    .Where(os => os.OrderId == orderId)
                    .ToListAsync();

                var totalServicePrice = (decimal)orderServices.Sum(os => os.Price * os.Quantity);
                return totalServicePrice;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tính tổng giá dịch vụ cho OrderId {orderId}: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateOrderTotalServicePriceAsync(int orderId, decimal totalServicePrice)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                    return false;
                var oldTotalServicePrice = order.TotalServicePrice ?? 0;
                order.TotalServicePrice = totalServicePrice;
                var fieldPrice = order.TotalPrice - oldTotalServicePrice;
                var totalPrice = fieldPrice + totalServicePrice;
                order.TotalPrice = totalPrice;

                _context.Orders.Update(order);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật tổng giá dịch vụ cho OrderId {orderId}: {ex.Message}", ex);
            }
        }
    }
}
