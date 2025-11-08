using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using SportZone_API.Repository.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Hubs;

namespace SportZone_API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IDiscountService _discountService;
        private readonly IMapper _mapper;
        private readonly SportZoneContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public OrderService(IOrderRepository orderRepository, IMapper mapper, SportZoneContext context, IBookingRepository bookingRepository, IDiscountService discountService, IHubContext<NotificationHub> hubContext)
        {
            _orderRepository = orderRepository;
            _mapper = mapper;
            _context = context;
            _bookingRepository = bookingRepository;
            _discountService = discountService;
            _hubContext = hubContext;
        }

        public async Task<OrderDTO> CreateOrderFromBookingAsync(Booking booking, int? discountId = null)
        {
            try
            {
                var fieldPrice = await CalculateBookingFieldPriceAsync(booking);
                var facId = booking.Field?.FacId ?? 1;
                var discountedFieldPrice = await _discountService.CalculateDiscountedPriceAsync(fieldPrice, discountId, facId);
                var orderCreateDto = new OrderCreateDTO
                {
                    BookingId = booking.BookingId,
                    UId = booking.UId,
                    FacId = facId,
                    DiscountId = discountId,
                    GuestName = booking.GuestName,
                    GuestPhone = booking.GuestPhone,
                    TotalPrice = discountedFieldPrice,
                    StatusPayment = "Pending",
                    CreateAt = booking.CreateAt ?? DateTime.Now
                };
                var order = await _orderRepository.CreateOrderFromBookingAsync(orderCreateDto);
                if (discountId.HasValue && discountedFieldPrice < fieldPrice)
                {
                    await _discountService.DecreaseDiscountQuantityAsync(discountId.Value);
                }
                var orderDto = await _orderRepository.GetOrderByIdAsync(order.OrderId);
                if (orderDto == null)
                    throw new Exception("Không thể lấy thông tin Order vừa tạo");
                var managerMessage = $"Đơn hàng mới (ID: {orderDto.OrderId}) đã được tạo cho booking (ID: {booking.BookingId}).";
                var customerMessage = $"Đơn hàng của bạn (ID: {orderDto.OrderId}) đã được tạo thành công.";

                await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ReceiveNotification", managerMessage);
                await _hubContext.Clients.Group($"facility-{facId}").SendAsync("OrderCreated", orderDto);
                if (orderDto.UId.HasValue)
                {
                    await _hubContext.Clients.User(orderDto.UId.Value.ToString()).SendAsync("ReceiveNotification", customerMessage);
                    await _hubContext.Clients.User(orderDto.UId.Value.ToString()).SendAsync("OrderCreated", orderDto);
                }
                return orderDto;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo Order từ Booking: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByIdAsync(int orderId)
        {
            try
            {
                return await _orderRepository.GetOrderByIdAsync(orderId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId)
        {
            try
            {
                return await _orderRepository.GetOrderByBookingIdAsync(bookingId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order theo BookingId: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> UpdateOrderContentPaymentAsync(int orderId, int option)
        {
            try
            {
                if (orderId <= 0)
                {
                    throw new ArgumentException("OrderId không hợp lệ", nameof(orderId));
                }
                if (option < 1 || option > 2)
                {
                    throw new ArgumentException("Option phải là 1 hoặc 2", nameof(option));
                }
                return await _orderRepository.UpdateOrderContentPaymentAsync(orderId, option);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật nội dung thanh toán của Order: {ex.Message}", ex);
            }
        }

        private async Task<decimal> CalculateBookingFieldPriceAsync(Booking booking)
        {
            try
            {
                var bookedSlots = await _bookingRepository.GetBookedSlotsByBookingIdAsync(booking.BookingId);

                if (!bookedSlots.Any())
                {
                    throw new Exception($"Không tìm thấy slot nào cho booking ID {booking.BookingId}");
                }
                var totalAfterFirstDivision = bookedSlots.Sum(slot => (slot.Price ?? 0) / 2);
                var fieldPrice = totalAfterFirstDivision / 2;

                return fieldPrice;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tính giá field cho booking: {ex.Message}", ex);
            }
        }

        public async Task<OwnerRevenueDTO> GetOwnerTotalRevenueAsync(int ownerId,
                                                                     DateTime? startDate = null,
                                                                     DateTime? endDate = null,
                                                                     int? facilityId = null)
        {
            try
            {
                if (ownerId <= 0)
                {
                    throw new ArgumentException("OwnerId không hợp lệ", nameof(ownerId));
                }
                if (startDate.HasValue && endDate.HasValue && startDate > endDate)
                {
                    throw new ArgumentException("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
                }
                if (facilityId.HasValue && facilityId <= 0)
                {
                    throw new ArgumentException("FacilityId không hợp lệ", nameof(facilityId));
                }
                return await _orderRepository.GetOwnerTotalRevenueAsync(ownerId, startDate, endDate, facilityId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy doanh thu của chủ sân: {ex.Message}", ex);
            }
        }

        public async Task<OrderDetailByScheduleDTO?> GetOrderByScheduleIdAsync(int scheduleId)
        {
            try
            {
                return await _orderRepository.GetOrderByScheduleIdAsync(scheduleId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy thông tin Order theo ScheduleId: {ex.Message}", ex);
            }
        }

        public async Task<OrderSlotDetailDTO?> GetOrderSlotDetailByScheduleIdAsync(int scheduleId)
        {
            try
            {
                return await _orderRepository.GetOrderSlotDetailByScheduleIdAsync(scheduleId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy thông tin slot theo ScheduleId: {ex.Message}", ex);
            }
        }
    }
}