using Microsoft.AspNetCore.SignalR;
using SportZone_API.DTOs;
using SportZone_API.Hubs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IFieldRepository _fieldRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public BookingService(IBookingRepository bookingRepository, IFieldRepository fieldRepository, IHubContext<NotificationHub> hubContext)
        {
            _bookingRepository = bookingRepository;
            _fieldRepository = fieldRepository;
            _hubContext = hubContext;
        }

        private DateTime CombineDateAndTime(DateOnly date, TimeOnly time)
        {
            return date.ToDateTime(time);
        }

        public async Task<BookingDetailDTO> CreateBookingAsync(BookingCreateDTO bookingDto)
        {
            try
            {
                var validation = await ValidateBookingRulesAsync(bookingDto);
                if (!validation.IsValid)
                    throw new ArgumentException(validation.ErrorMessage);
                var booking = await _bookingRepository.CreateBookingAsync(bookingDto, "Success");
                var detail = await _bookingRepository.GetBookingByIdAsync(booking.BookingId);
                if (detail == null)
                    throw new Exception("Không thể lấy thông tin booking vừa tạo");
                var field = await _fieldRepository.GetFieldByIdAsync(bookingDto.FieldId.Value);
                if (field != null)
                {
                    var facId = field.FacId;
                    var firstBookedSlot = detail.BookedSlots.FirstOrDefault();
                    if (firstBookedSlot != null)
                    {
                        var managerMessage = $"Một booking mới (ID: {detail.BookingId}) đã được tạo cho sân '{field.FieldName}' vào lúc {firstBookedSlot.StartTime.ToString("HH:mm")} ngày {firstBookedSlot.Date.ToString("dd-MM-yyyy")}.";
                        await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ReceiveNotification", managerMessage);
                        await _hubContext.Clients.Group($"facility-{facId}").SendAsync("BookingCreated", detail);
                    }
                }
                if (detail.UserId.HasValue)
                {
                    var userMessage = $"Booking của bạn (ID: {detail.BookingId}) đã được xác nhận thành công.";
                    await _hubContext.Clients.User(detail.UserId.Value.ToString()).SendAsync("ReceiveNotification", userMessage);
                }
                return detail;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo booking: {ex.Message}", ex);
            }
        }

        public async Task<BookingDetailDTO?> GetBookingDetailAsync(int bookingId)
        {
            try
            {
                if (bookingId <= 0)
                    throw new ArgumentException("Booking ID không hợp lệ");

                return await _bookingRepository.GetBookingByIdAsync(bookingId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy chi tiết booking: {ex.Message}", ex);
            }
        }

        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            try
            {
                if (bookingId <= 0)
                    throw new ArgumentException("Booking ID không hợp lệ");

                var booking = await _bookingRepository.GetBookingEntityByIdAsync(bookingId);
                if (booking == null)
                    throw new KeyNotFoundException("Không tìm thấy booking với ID đã cho");

                var schedule = booking.FieldBookingSchedules?.FirstOrDefault();
                if (schedule?.Date.HasValue == true && schedule?.StartTime.HasValue == true)
                {
                    var bookingDateTime = CombineDateAndTime(schedule.Date.Value, schedule.EndTime.Value);
                    if (bookingDateTime.AddHours(-2) <= DateTime.Now)
                    {
                        throw new InvalidOperationException("Không thể hủy booking trong vòng 2 giờ trước giờ bắt đầu");
                    }
                }

                var isCancelled = await _bookingRepository.CancelBookingAsync(bookingId);
                if (isCancelled)
                {
                    var field = booking.FieldBookingSchedules?.FirstOrDefault()?.Field;
                    if (field != null)
                    {
                        var facId = field.FacId;
                        var managerMessage = $"Booking (ID: {bookingId}) cho sân '{field.FieldName}' đã được hủy.";
                        await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ReceiveNotification", managerMessage);
                        await _hubContext.Clients.Group($"facility-{facId}").SendAsync("BookingCancelled", bookingId);
                    }
                    if (booking.UId.HasValue)
                    {
                        var userMessage = $"Booking (ID: {bookingId}) của bạn đã được hủy thành công.";
                        await _hubContext.Clients.User(booking.UId.Value.ToString()).SendAsync("ReceiveNotification", userMessage);
                    }
                }
                return isCancelled;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi hủy booking: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<BookingResponseDTO>> GetUserBookingsAsync(int userId)
        {
            try
            {
                if (userId <= 0)
                    throw new ArgumentException("User ID không hợp lệ");

                return await _bookingRepository.GetBookingsByUserAsync(userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy booking của customer: {ex.Message}", ex);
            }
        }

        public async Task<(bool IsValid, string ErrorMessage)> ValidateBookingRulesAsync(BookingCreateDTO bookingDto)
        {
            try
            {

                if (!bookingDto.SelectedSlotIds.Any())
                    return (false, "Phải chọn ít nhất 1 slot thời gian");

                if (!bookingDto.UserId.HasValue)
                {
                    if (string.IsNullOrWhiteSpace(bookingDto.GuestName))
                        return (false, "Tên khách là bắt buộc cho booking khách lẻ");

                    if (string.IsNullOrWhiteSpace(bookingDto.GuestPhone))
                        return (false, "Số điện thoại là bắt buộc cho booking khách lẻ");

                    if (!IsValidPhoneNumber(bookingDto.GuestPhone))
                        return (false, "Số điện thoại không hợp lệ");
                }

                var slotsValidation = await _bookingRepository.ValidateSelectedSlotsAsync(
                    bookingDto.SelectedSlotIds,
                    bookingDto.FieldId,
                    bookingDto.FacilityId);
                if (!slotsValidation.IsValid)
                    return (false, slotsValidation.ErrorMessage);



                return (true, string.Empty);
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi khi kiểm tra quy tắc booking: {ex.Message}");
            }
        }

        private bool IsValidPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return false;
            var phonePattern = @"^[\+]?[0-9]?[\(\)\-\s\.]*[0-9]{8,15}$";
            return System.Text.RegularExpressions.Regex.IsMatch(phoneNumber, phonePattern);
        }

        public async Task<bool> CheckTimeSlotAvailabilityAsync(int fieldId, DateOnly date, TimeOnly startTime, TimeOnly endTime)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("Field ID không hợp lệ");

                if (startTime >= endTime)
                    throw new ArgumentException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");

                var bookingDateTime = CombineDateAndTime(date, startTime);
                if (bookingDateTime <= DateTime.Now)
                    throw new ArgumentException("Không thể kiểm tra thời gian trong quá khứ");

                return await _bookingRepository.CheckTimeSlotAvailabilityAsync(fieldId, date, startTime, endTime);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi kiểm tra thời gian trống: {ex.Message}", ex);
            }
        }

        public async Task<ServiceResponse<decimal>> CalculateTotalAmount(CalculateAmountDTO calculateDto)
        {
            try
            {
                if (calculateDto.SelectedSlotIds == null || !calculateDto.SelectedSlotIds.Any())
                {
                    return new ServiceResponse<decimal>
                    {
                        Success = false,
                        Message = "Phải chọn ít nhất 1 slot thời gian",
                        Data = 0
                    };
                }

                decimal totalAmount = 0;

                // Tính tiền từ các slot đã chọn
                foreach (var slotId in calculateDto.SelectedSlotIds)
                {
                    var slot = await _bookingRepository.GetFieldBookingScheduleByIdAsync(slotId);
                    if (slot != null && slot.Price.HasValue)
                    {
                        totalAmount += slot.Price.Value;
                    }
                }

                // Tính tiền từ các dịch vụ
                if (calculateDto.ServiceIds != null && calculateDto.ServiceIds.Any())
                {
                    foreach (var serviceId in calculateDto.ServiceIds)
                    {
                        var service = await _bookingRepository.GetServiceByIdAsync(serviceId);
                        if (service != null && service.Price.HasValue)
                        {
                            totalAmount += service.Price.Value;
                        }
                    }
                }

                // Áp dụng giảm giá
                if (calculateDto.DiscountId.HasValue)
                {
                    var discount = await _bookingRepository.GetDiscountByIdAsync(calculateDto.DiscountId.Value);
                    if (discount != null && discount.DiscountPercentage.HasValue)
                    {
                        decimal discountAmount = totalAmount * (discount.DiscountPercentage.Value / 100);
                        totalAmount -= discountAmount;
                    }
                }

                return new ServiceResponse<decimal>
                {
                    Success = true,
                    Message = "Tính toán tổng tiền thành công",
                    Data = totalAmount
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<decimal>
                {
                    Success = false,
                    Message = $"Lỗi khi tính toán tổng tiền: {ex.Message}",
                    Data = 0
                };
            }
        }

        // Dictionary để lưu trữ thông tin pending bookings
        private static readonly Dictionary<string, PendingBookingInfo> _pendingBookings = new Dictionary<string, PendingBookingInfo>();
        private static readonly object _pendingLock = new object();

        public async Task<ServiceResponse<BookingDetailDTO>> CreatePendingBookingAsync(BookingCreateDTO bookingDto, string orderId)
        {
            try
            {
                // Validate business rules
                var validation = await ValidateBookingRulesAsync(bookingDto);
                if (!validation.IsValid)
                {
                    return new ServiceResponse<BookingDetailDTO>
                    {
                        Success = false,
                        Message = validation.ErrorMessage,
                        Data = null
                    };
                }

                // Tạo booking với status Pending - sử dụng bookingDto gốc
                var pendingBookingDto = new BookingCreateDTO
                {
                    SelectedSlotIds = bookingDto.SelectedSlotIds,
                    ServiceIds = bookingDto.ServiceIds,
                    DiscountId = bookingDto.DiscountId,
                    UserId = bookingDto.UserId,
                    GuestName = bookingDto.GuestName,
                    GuestPhone = bookingDto.GuestPhone,
                    Title = bookingDto.Title,
                    FieldId = bookingDto.FieldId,
                    FacilityId = bookingDto.FacilityId
                };

                // Tạo booking với status Pending
                var booking = await _bookingRepository.CreateBookingAsync(pendingBookingDto, "Pending");

                // Lưu thông tin pending booking
                var pendingInfo = new PendingBookingInfo
                {
                    OrderId = orderId,
                    BookingId = booking.BookingId,
                    CreatedAt = DateTime.Now,
                    ExpiresAt = DateTime.Now.AddMinutes(1) // Hết hạn sau 1 phút
                };

                lock (_pendingLock)
                {
                    _pendingBookings[orderId] = pendingInfo;
                    Console.WriteLine($"Đã lưu pending booking: OrderId={orderId}, BookingId={booking.BookingId}, ExpiresAt={pendingInfo.ExpiresAt}");
                }

              
                var detail = await _bookingRepository.GetBookingByIdAsync(booking.BookingId);
                return new ServiceResponse<BookingDetailDTO>
                {
                    Success = true,
                    Message = $"Đã tạo booking tạm thời với ID {booking.BookingId}. Hết hạn sau 5 phút.",
                    Data = detail ?? throw new Exception("Không thể lấy thông tin booking vừa tạo")
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<BookingDetailDTO>
                {
                    Success = false,
                    Message = $"Lỗi khi tạo booking tạm thời: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<bool> ConfirmBookingAsync(int bookingId)
        {
            try
            {
                
                var booking = await _bookingRepository.GetBookingEntityByIdAsync(bookingId);
                if (booking == null)
                    return false;

                // Update cả Status và StatusPayment thành Success khi thanh toán thành công
                booking.Status = "Success";
                booking.StatusPayment = "Success";
                await _bookingRepository.UpdateBookingAsync(booking);

                
                lock (_pendingLock)
                {
                    var orderId = _pendingBookings.FirstOrDefault(x => x.Value.BookingId == bookingId).Key;
                    if (!string.IsNullOrEmpty(orderId))
                    {
                        _pendingBookings.Remove(orderId);
                    }
                }

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> CancelPendingBookingAsync(int bookingId)
        {
            try
            {
                Console.WriteLine($"Bắt đầu xóa booking {bookingId}...");
                
                
                var result = await _bookingRepository.DeleteBookingAsync(bookingId);
                
                Console.WriteLine($"Kết quả xóa booking {bookingId}: {result}");

                
                lock (_pendingLock)
                {
                    var orderId = _pendingBookings.FirstOrDefault(x => x.Value.BookingId == bookingId).Key;
                    if (!string.IsNullOrEmpty(orderId))
                    {
                        _pendingBookings.Remove(orderId);
                        Console.WriteLine($"Đã xóa pending booking với OrderId: {orderId}");
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xóa booking {bookingId}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return false;
            }
        }

        public async Task CleanupExpiredPendingBookingsAsync()
        {
            try
            {
                List<PendingBookingInfo> expiredBookings;
                
                lock (_pendingLock)
                {
                    var now = DateTime.Now;
                    var expiredOrderIds = _pendingBookings
                        .Where(kvp => kvp.Value.ExpiresAt <= now)
                        .Select(kvp => kvp.Key)
                        .ToList();

                    expiredBookings = expiredOrderIds
                        .Select(orderId => _pendingBookings[orderId])
                        .ToList();

                    
                    foreach (var orderId in expiredOrderIds)
                    {
                        _pendingBookings.Remove(orderId);
                    }
                }

                Console.WriteLine($"Tìm thấy {expiredBookings.Count} booking hết hạn cần xử lý");

                
                foreach (var pendingInfo in expiredBookings)
                {
                    try
                    {
                        Console.WriteLine($"Đang xóa booking {pendingInfo.BookingId} (OrderId: {pendingInfo.OrderId}) - Hết hạn lúc: {pendingInfo.ExpiresAt}");
                        
                        var result = await CancelPendingBookingAsync(pendingInfo.BookingId);
                        
                        if (result)
                        {
                            Console.WriteLine($"✅ Đã xóa thành công booking {pendingInfo.BookingId} do hết hạn thanh toán");
                        }
                        else
                        {
                            Console.WriteLine($"❌ Không thể xóa booking {pendingInfo.BookingId}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Lỗi khi hủy booking hết hạn {pendingInfo.BookingId}: {ex.Message}");
                    }
                }

                if (expiredBookings.Any())
                {
                    Console.WriteLine($"✅ Đã xử lý {expiredBookings.Count} booking hết hạn");
                }
                else
                {
                    Console.WriteLine($"ℹ️ Không có booking nào hết hạn tại {DateTime.Now}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi khi cleanup expired pending bookings: {ex.Message}");
            }
        }

        public async Task<List<PendingBookingDto>> GetPendingBookingsAsync()
        {
            lock (_pendingLock)
            {
                var now = DateTime.Now;
                var activeBookings = _pendingBookings.Values
                    .Where(p => p.ExpiresAt > now)
                    .Select(p => new PendingBookingDto
                    {
                        OrderId = p.OrderId,
                        BookingId = p.BookingId,
                        CreatedAt = p.CreatedAt,
                        ExpiresAt = p.ExpiresAt,
                        BookingData = null 
                    })
                    .ToList();
                
                Console.WriteLine($"Có {activeBookings.Count} pending bookings đang hoạt động:");
                foreach (var booking in activeBookings)
                {
                    Console.WriteLine($"- OrderId: {booking.OrderId}, BookingId: {booking.BookingId}, ExpiresAt: {booking.ExpiresAt}");
                }
                
                return activeBookings;
            }
        }

        

        // Helper class để lưu trữ thông tin pending booking
        private class PendingBookingInfo
        {
            public string OrderId { get; set; } = string.Empty;
            public int BookingId { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime ExpiresAt { get; set; }
        }
    }
}