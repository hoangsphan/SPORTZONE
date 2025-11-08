using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;
using SportZone_API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace SportZone_API.Services
{
    public class OrderServiceService : IOrderServiceService
    {
        private readonly IOrderServiceRepository _orderServiceRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public OrderServiceService(
            IOrderServiceRepository orderServiceRepository,
            IOrderRepository orderRepository,
            IHubContext<NotificationHub> hubContext)
        {
            _orderServiceRepository = orderServiceRepository;
            _orderRepository = orderRepository;
            _hubContext = hubContext;
        }

        public async Task<OrderServiceDTO> AddServiceToOrderAsync(OrderServiceCreateDTO orderServiceDto)
        {
            try
            {
                if (orderServiceDto.Quantity <= 0)
                    throw new ArgumentException("Số lượng dịch vụ phải lớn hơn 0");
                var orderService = await _orderServiceRepository.CreateOrderServiceAsync(orderServiceDto);
                var order = await _orderRepository.GetOrderByIdAsync(orderService.OrderId);
                if (order != null)
                {
                    var serviceName = orderService?.ServiceName ?? "Dịch vụ";
                    var managerMessage = $"{serviceName} đã được thêm vào đơn hàng {order.OrderId}!";
                    await _hubContext.Clients.Group($"facility-{order.FacId}").SendAsync("ReceiveNotification", managerMessage);
                    if (order.UId.HasValue)
                    {
                        var customerMessage = $"Đơn hàng của bạn (ID: {order.OrderId}) đã được cập nhật thêm dịch vụ {serviceName}.";
                        await _hubContext.Clients.User(order.UId.Value.ToString()).SendAsync("ReceiveNotification", customerMessage);
                    }
                }
                return orderService;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi thêm dịch vụ vào đơn hàng: {ex.Message}", ex);
            }
        }

        public async Task<OrderServiceDTO?> GetOrderServiceByIdAsync(int orderServiceId)
        {
            try
            {
                if (orderServiceId <= 0)
                    throw new ArgumentException("OrderService ID không hợp lệ");

                return await _orderServiceRepository.GetOrderServiceByIdAsync(orderServiceId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy thông tin OrderService: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<OrderServiceDTO>> GetOrderServicesByOrderIdAsync(int orderId)
        {
            try
            {
                if (orderId <= 0)
                    throw new ArgumentException("Order ID không hợp lệ");

                return await _orderServiceRepository.GetOrderServicesByOrderIdAsync(orderId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách services trong order: {ex.Message}", ex);
            }
        }

        public async Task<OrderServiceDTO?> UpdateOrderServiceAsync(int orderServiceId, OrderServiceUpdateDTO updateDto)
        {
            try
            {
                if (orderServiceId <= 0)
                    throw new ArgumentException("OrderService ID không hợp lệ");
                if (updateDto.Quantity.HasValue && updateDto.Quantity.Value < 0)
                    throw new ArgumentException("Số lượng dịch vụ không thể nhỏ hơn 0");
                var existingOrderService =  await _orderServiceRepository.GetOrderServiceByIdAsync(orderServiceId);
                if (existingOrderService == null)
                    throw new ArgumentException("OrderService không tồn tại");

                var updateOrderService = await _orderServiceRepository.UpdateOrderServiceAsync(orderServiceId, updateDto);
                return updateOrderService;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật thông tin OrderService: {ex.Message}", ex);
            }
        }

        public async Task<bool> RemoveServiceFromOrderAsync(int orderServiceId)
        {
            try
            {
                if (orderServiceId <= 0)
                    throw new ArgumentException("OrderService ID không hợp lệ");
                var existingOrderService = await _orderServiceRepository.GetOrderServiceByIdAsync(orderServiceId);
                if (existingOrderService == null)
                    throw new ArgumentException("OrderService không tồn tại");
                var order = await _orderRepository.GetOrderByIdAsync(existingOrderService.OrderId);
                if (order == null)
                    throw new ArgumentException("Không tìm thấy đơn hàng của dịch vụ này");
                var serviceName = existingOrderService?.ServiceName ?? "Dịch vụ";
                var result = await _orderServiceRepository.DeleteOrderServiceAsync(orderServiceId);
                if (result)
                {
                    var managerMessage = $"{serviceName} đã bị xóa khỏi đơn hàng {order.OrderId}.";
                    await _hubContext.Clients.Group($"facility-{order.FacId}").SendAsync("ReceiveNotification", managerMessage);
                    if (order.UId.HasValue)
                    {
                        var customerMessage = $"Đơn hàng của bạn (ID: {order.OrderId}) đã được cập nhật, {serviceName} đã bị xóa.";
                        await _hubContext.Clients.User(order.UId.Value.ToString()).SendAsync("ReceiveNotification", customerMessage);
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa service khỏi order: {ex.Message}", ex);
            }
        }
    }
}