using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Linq;

namespace SportZone_API.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper;

        public OrderRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Order> CreateOrderFromBookingAsync(OrderCreateDTO orderDto)
        {
            try
            {
                var order = _mapper.Map<Order>(orderDto);
                order.TotalPrice = orderDto.TotalPrice ?? 0;
                order.TotalServicePrice = 0;
                order.CreateAt = orderDto.CreateAt ?? DateTime.UtcNow;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                return order;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo Order từ Booking: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByBookingIdAsync(int bookingId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Booking)
                    .Include(o => o.Fac)
                    .Include(o => o.Discount)
                    .Include(o => o.OrderServices)
                        .ThenInclude(os => os.Service)
                    .FirstOrDefaultAsync(o => o.BookingId == bookingId);

                if (order == null)
                {
                    return null;                   
                }
                return _mapper.Map<OrderDTO>(order);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order theo BookingId: {ex.Message}", ex);
            }
        }

        public async Task<OrderDTO?> GetOrderByIdAsync(int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.Booking)
                    .Include(o => o.Fac)
                    .Include(o => o.Discount)
                    .Include(o => o.OrderServices)
                        .ThenInclude(os => os.Service)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null) return null;

                return _mapper.Map<OrderDTO>(order);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order: {ex.Message}", ex);
            }
        }


        public async Task<OrderDTO?> UpdateOrderContentPaymentAsync(int orderId, int option)
        {
            try
            {
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);
                if (order == null)
                {
                    return null;
                }
                if (option == 1)
                {
                    order.ContentPayment = "Thanh toán tiền mặt";
                }
                else if (option == 2)
                {
                    order.ContentPayment = "Thanh toán qua ví điện tử";
                }
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();
                return _mapper.Map<OrderDTO>(order);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật nội dung thanh toán của Order: {ex.Message}", ex);
            }
        }

        public async Task<OwnerRevenueDTO> GetOwnerTotalRevenueAsync(int ownerId,
                                                                     DateTime? startDate = null,
                                                                     DateTime? endDate = null,
                                                                     int? facilityId = null)
        {
            try
            {
                var owner = await _context.FieldOwners
                .Include(fo => fo.Facilities)
                .FirstOrDefaultAsync(fo => fo.UId == ownerId);
                if (owner == null)
                {
                    throw new Exception("Chủ sân không tồn tại");
                }

                var ordersQuery = _context.Orders
                    .Include(o => o.Fac)
                    .Where(o => o.Fac.UId == ownerId);
                //(o.StatusPayment == "Comleted" || o.StatusPayment == "Paid")
                if (startDate.HasValue)
                {
                    ordersQuery = ordersQuery.Where(o => o.CreateAt >= startDate.Value);
                }
                if (endDate.HasValue)
                {
                    ordersQuery = ordersQuery.Where(o => o.CreateAt <= endDate.Value);
                }

                if (facilityId.HasValue)
                {
                    ordersQuery = ordersQuery.Where(o => o.FacId == facilityId.Value);
                }

                var orders = await ordersQuery.ToListAsync();

                var totalRevenue = orders.Sum(o => o.TotalPrice) ?? 0;
                var totalFieldRevenue = orders.Sum(o => o.TotalPrice ?? 0) - orders.Sum(o => o.TotalServicePrice ?? 0);
                var totalServiceRevenue = orders.Sum(o => o.TotalServicePrice) ?? 0;
                var totalOrders = orders.Count;

                var facilityRevenuesData = await ordersQuery
                    .GroupBy(o => new
                    {
                        o.FacId,
                        o.Fac.Name
                    })
                    .Select(g => new
                    {
                        FacilityId = g.Key.FacId,
                        FacilityName = g.Key.Name,
                        Revenue = g.Sum(o => o.TotalPrice) ?? 0,
                        FieldRevenue = g.Sum(o => o.TotalPrice ?? 0) - g.Sum(o => o.TotalServicePrice ?? 0),
                        ServiceRevenue = g.Sum(o => o.TotalServicePrice) ?? 0,
                        OrderCount = g.Count()
                    })
                    .ToListAsync();

                var facilityRevenues = facilityRevenuesData.Select(r => new FacilityRevenueDTO
                {
                    FacilityId = r.FacilityId,
                    FacilityName = r.FacilityName,
                    Revenue = r.Revenue,
                    FieldRevenue = r.FieldRevenue,
                    ServiceRevenue = r.ServiceRevenue,
                    OrderCount = r.OrderCount
                })
                .ToList();

                var monthlyRevenueData = await ordersQuery
                    .GroupBy(o => new
                    {
                        Year = o.CreateAt.Value.Year,
                        Month = o.CreateAt.Value.Month
                    })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Revenue = g.Sum(o => o.TotalPrice) ?? 0,
                        FieldRevenue = g.Sum(o => o.TotalPrice ?? 0) - g.Sum(o => o.TotalServicePrice ?? 0),
                        ServiceRevenue = g.Sum(o => o.TotalServicePrice) ?? 0,
                        OrderCount = g.Count()
                    })
                    .OrderBy(r => r.Year).ThenBy(r => r.Month).ToListAsync();

                var monthlyRevenue = monthlyRevenueData.Select(r => new TimeRevenueDTO
                {
                    Period = $"{r.Year}-{r.Month:D2}",
                    Revenue = r.Revenue,
                    FieldRevenue = r.FieldRevenue,
                    ServiceRevenue = r.ServiceRevenue,
                    OrderCount = r.OrderCount
                })
                .ToList();

                var yearlyRevenueData = await ordersQuery
                    .GroupBy(o => o.CreateAt.Value.Year)
                    .Select(g => new
                    {
                        Year = g.Key,
                        Revenue = g.Sum(o => o.TotalPrice) ?? 0,
                        FieldRevenue = g.Sum(o => o.TotalPrice ?? 0) - g.Sum(o => o.TotalServicePrice ?? 0),
                        ServiceRevenue = g.Sum(o => o.TotalServicePrice) ?? 0,
                        OrderCount = g.Count()
                    })
                    .OrderBy(r => r.Year).ToListAsync();

                var yearlyRevenue = yearlyRevenueData.Select(r => new TimeRevenueDTO
                {
                    Period = r.Year.ToString(),
                    Revenue = r.Revenue,
                    FieldRevenue = r.FieldRevenue,
                    ServiceRevenue = r.ServiceRevenue,
                    OrderCount = r.OrderCount
                })
                .ToList();

                return new OwnerRevenueDTO
                {
                    OwnerId = ownerId,
                    OwnerName = owner.Name,
                    TotalRevenue = totalRevenue,
                    TotalFieldRevenue = totalFieldRevenue,
                    TotalServiceRevenue = totalServiceRevenue,
                    TotalOrders = totalOrders,
                    StartDate = startDate,
                    EndDate = endDate,
                    Facilities = facilityRevenues,
                    MonthlyRevenue = monthlyRevenue,
                    YearlyRevenue = yearlyRevenue
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy doanh thu tổng của chủ sân: {ex.Message}", ex);
            }
        }

        public async Task<OrderDetailByScheduleDTO?> GetOrderByScheduleIdAsync(int scheduleId)
        {
            try
            {
                var schedule = await _context.FieldBookingSchedules
                    .Include(s => s.Booking)
                    .Include(s => s.Field)
                        .ThenInclude(f => f.Category)
                    .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);

                if (schedule == null || schedule.Booking == null)
                {
                    return null;
                }

                var order = await _context.Orders
                    .Include(o => o.Booking)
                    .Include(o => o.Fac)
                    .Include(o => o.Discount)
                    .Include(o => o.OrderServices)
                        .ThenInclude(os => os.Service)
                    .Include(o => o.UIdNavigation)
                        .ThenInclude(u => u.Customer)
                    .FirstOrDefaultAsync(o => o.BookingId == schedule.Booking.BookingId);

                if (order == null)
                {
                    return null;
                }

                var bookedSlots = await _context.FieldBookingSchedules
                    .Include(s => s.Field)
                         .ThenInclude(f => f.Category)
                    .Where(s => s.BookingId == schedule.BookingId)
                    .OrderBy(s => s.Date)
                    .ThenBy(s => s.StartTime)
                    .ToListAsync();

                var orderDetail = new OrderDetailByScheduleDTO
                {
                    OrderId = order.OrderId,
                    UId = order.UId,
                    FacId = order.FacId,
                    DiscountId = order.DiscountId,
                    BookingId = order.BookingId,
                    GuestName = order.GuestName,
                    GuestPhone = order.GuestPhone,
                    TotalPrice = order.TotalPrice,
                    TotalServicePrice = order.TotalServicePrice,
                    ContentPayment = order.ContentPayment,
                    StatusPayment = order.StatusPayment,
                    CreateAt = order.CreateAt,
                    FacilityName = order.Fac?.Name,
                    FacilityAddress = order.Fac?.Address,
                    CustomerInfo = new OrderCustomerInfoDTO(),
                    BookedSlots = new List<BookingSlotDTO>(),
                    Services = new List<OrderDetailServiceDTO>(),
                    DiscountInfo = null
                };

                if (order.UId != null && order.UIdNavigation != null)
                {
                    orderDetail.CustomerInfo.CustomerType = "User";
                    orderDetail.CustomerInfo.Name = order.UIdNavigation.Customer?.Name;
                    orderDetail.CustomerInfo.Phone = order.UIdNavigation.Customer?.Phone;
                    orderDetail.CustomerInfo.Email = order.UIdNavigation.UEmail;
                }
                else if (!string.IsNullOrEmpty(order.GuestName))
                {
                    orderDetail.CustomerInfo.CustomerType = "Guest";
                    orderDetail.CustomerInfo.Name = order.GuestName;
                    orderDetail.CustomerInfo.Phone = order.GuestPhone;
                }

                foreach (var slot in bookedSlots)
                {
                    orderDetail.BookedSlots.Add(new BookingSlotDTO
                    {
                        ScheduleId = slot.ScheduleId,
                        FieldId = slot.FieldId ?? 0,
                        FieldName = slot.Field?.FieldName,
                        CategoryName = slot.Field?.Category?.CategoryFieldName,
                        StartTime = slot.StartTime ?? TimeOnly.MinValue,
                        EndTime = slot.EndTime ?? TimeOnly.MinValue,
                        Date = slot.Date ?? DateOnly.MinValue,
                        Price = slot.Price,
                        Status = slot.Status
                    });
                }

                foreach (var orderService in order.OrderServices)
                {
                    orderDetail.Services.Add(new OrderDetailServiceDTO
                    {
                        ServiceId = orderService.ServiceId ?? 0,
                        ServiceName = orderService.Service?.ServiceName,
                        Price = orderService.Price,
                        Quantity = orderService.Quantity,
                        ImageUrl = orderService.Service?.Image
                    });
                }

                if (order.Discount != null)
                {
                    orderDetail.DiscountInfo = new OrderDiscountInfoDTO
                    {
                        DiscountId = order.Discount.DiscountId,
                        DiscountPercentage = order.Discount.DiscountPercentage,
                        Description = order.Discount.Description,
                        DiscountAmount = order.TotalPrice.HasValue && order.Discount.DiscountPercentage.HasValue
                            ? (order.TotalPrice.Value * order.Discount.DiscountPercentage.Value / 100)
                            : null
                    };
                }

                return orderDetail;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Order theo ScheduleId: {ex.Message}", ex);
            }
        }

        public async Task<OrderSlotDetailDTO?> GetOrderSlotDetailByScheduleIdAsync(int scheduleId)
        {
            try
            {
                var schedule = await _context.FieldBookingSchedules
                    .Include(s => s.Booking)
                         .ThenInclude(b => b.UIdNavigation)
                               .ThenInclude(u => u.Customer)
                    .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);

                if (schedule == null || schedule.Booking == null)
                {
                    return null;
                }

                var booking = schedule.Booking;
                string? name = booking.UIdNavigation?.Customer?.Name ?? booking.GuestName;
                string? phone = booking.UIdNavigation?.Customer?.Phone ?? booking.GuestPhone;

                return new OrderSlotDetailDTO
                {
                    Name = name,
                    Phone = phone,
                    StartTime = (schedule.StartTime ?? TimeOnly.MinValue).ToString("HH:mm"),
                    EndTime = (schedule.EndTime ?? TimeOnly.MinValue).ToString("HH:mm"),
                    Date = (schedule.Date ?? DateOnly.MinValue).ToString("dd/MM/yyyy")
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy chi tiết Order theo ScheduleId: {ex.Message}", ex);
            }
        }
    }
}