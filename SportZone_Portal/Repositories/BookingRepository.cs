using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.DTOs;
using SportZone_API.Repository.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace SportZone_API.Repository
{
    public class BookingRepository : IBookingRepository
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper;

        public BookingRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Booking> CreateBookingAsync(BookingCreateDTO bookingDto, string? statusPayment = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate input
                ValidateBookingInput(bookingDto);

                // Validate selected slots với filter constraints
                var slotsValidation = await ValidateSelectedSlotsAsync(
                    bookingDto.SelectedSlotIds,
                    bookingDto.FieldId,
                    bookingDto.FacilityId);
                if (!slotsValidation.IsValid)
                    throw new ArgumentException(slotsValidation.ErrorMessage);

                // Lấy thông tin các slots được chọn
                var selectedSlots = await _context.FieldBookingSchedules
                    .Include(s => s.Field)
                        .ThenInclude(f => f.Fac)
                    .Where(s => bookingDto.SelectedSlotIds.Contains(s.ScheduleId))
                    .ToListAsync();

                if (selectedSlots.Count != bookingDto.SelectedSlotIds.Count)
                    throw new ArgumentException("Một hoặc nhiều slot không tồn tại hoặc không hợp lệ");

                // Lấy thông tin slot đầu tiên để làm reference cho booking
                var firstSlot = selectedSlots.First();
                var lastSlot = selectedSlots.Last();
                // Kiểm tra field có tồn tại và cho phép booking không
                var field = firstSlot.Field;
                if (field == null)
                    throw new ArgumentException($"Sân với ID {firstSlot.FieldId} không tồn tại");

                if (field.IsBookingEnable != true)
                    throw new ArgumentException($"Sân '{field.FieldName}' không cho phép đặt chỗ");

                if (field.Fac == null)
                    throw new ArgumentException($"Sân '{field.FieldName}' không có thông tin cơ sở");

                var booking = new Booking
                {
                    FieldId = firstSlot.FieldId ?? 0,
                    UId = bookingDto.UserId,
                    Title = bookingDto.Title,
                    Date = firstSlot.Date,
                    StartTime = firstSlot.StartTime,
                    EndTime = lastSlot.EndTime,
                    Status = statusPayment ?? "Pending",
                    StatusPayment = statusPayment ?? "Pending",
                    CreateAt = DateTime.Now,
                    GuestName = bookingDto.UserId.HasValue ? null : bookingDto.GuestName,
                    GuestPhone = bookingDto.UserId.HasValue ? null : bookingDto.GuestPhone
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Update tất cả các slots với BookingId
                foreach (var slot in selectedSlots)
                {
                    slot.BookingId = booking.BookingId;
                    slot.Status = "Booked";
                    if (string.IsNullOrEmpty(slot.Notes))
                    {
                        slot.Notes = bookingDto.Notes; 
                    }
                }

                _context.FieldBookingSchedules.UpdateRange(selectedSlots);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return booking;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var detailMessage = $"Lỗi khi tạo booking: {ex.Message}";
                if (ex.InnerException != null)
                    detailMessage += $" | Inner: {ex.InnerException.Message}";
                if (ex.InnerException?.InnerException != null)
                    detailMessage += $" | Inner2: {ex.InnerException.InnerException.Message}";

                throw new Exception(detailMessage, ex);
            }
        }

        public async Task<(bool IsValid, string ErrorMessage)> ValidateSelectedSlotsAsync(List<int> selectedSlotIds,
                                                                                                int? fieldId = null, 
                                                                                               int? facilityId = null)
        {
            try
            {
                if (!selectedSlotIds.Any())
                    return (false, "Phải chọn ít nhất 1 slot thời gian");

                var slots = await _context.FieldBookingSchedules
                    .Include(s => s.Field)
                        .ThenInclude(f => f.Category)
                    .Include(s => s.Field)
                        .ThenInclude(f => f.Fac)
                    .Where(s => selectedSlotIds.Contains(s.ScheduleId))
                    .ToListAsync();

                if (slots.Count != selectedSlotIds.Count)
                    return (false, "Một hoặc nhiều slot không tồn tại");

                var unavailableSlots = slots.Where(s => s.Status != "Available").ToList();
                if (unavailableSlots.Any())
                    return (false, $"Có {unavailableSlots.Count} slot không khả dụng (Booked)");

                var dates = slots.Select(s => s.Date).Distinct().ToList();
                if (dates.Count > 1)
                    return (false, "Tất cả các slot phải cùng ngày");

                if (fieldId.HasValue)
                {
                    var wrongFieldSlots = slots.Where(s => s.FieldId != fieldId.Value).ToList();
                    if (wrongFieldSlots.Any())
                        return (false, $"Tất cả các slot phải thuộc sân với ID {fieldId.Value}");
                }
                else
                {
                    // Nếu không chỉ định FieldId, check tất cả slots cùng facility
                    var facilityIds = slots.Select(s => s.Field?.FacId).Distinct().ToList();
                    if (facilityIds.Count > 1)
                        return (false, "Tất cả các slot phải thuộc cùng một cơ sở");
                }

                // Validate FacilityId nếu được chỉ định
                if (facilityId.HasValue)
                {
                    var wrongFacilitySlots = slots.Where(s => s.Field?.FacId != facilityId.Value).ToList();
                    if (wrongFacilitySlots.Any())
                        return (false, $"Tất cả các slot phải thuộc cơ sở với ID {facilityId.Value}");
                }

                // Check không có slot nào trong quá khứ
                var currentDate = DateOnly.FromDateTime(DateTime.Now);
                var currentTime = TimeOnly.FromDateTime(DateTime.Now);

                foreach (var slot in slots)
                {
                    if (slot.Date < currentDate ||
                        (slot.Date == currentDate && slot.StartTime < currentTime))
                    {
                        return (false, "Không thể đặt sân trong quá khứ");
                    }
                }

                return (true, string.Empty);
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi khi kiểm tra slots: {ex.Message}");
            }
        }
        public async Task<BookingDetailDTO?> GetBookingByIdAsync(int bookingId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Fac)
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Category)
                    .Include(b => b.Field)
                        .ThenInclude(f => f.FieldPricings)
                    .Include(b => b.UIdNavigation)
                        .ThenInclude(u => u.Customer)
                    .Include(b => b.Orders)
                        .ThenInclude(o => o.OrderServices)
                            .ThenInclude(os => os.Service)
                    .Include(b => b.Orders)
                        .ThenInclude(o => o.Discount)
                    .Include(b => b.FieldBookingSchedules)
                        .ThenInclude(s => s.Field)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null)
                    return null;

                return BookingMapper.MapToBookingDetailDTO(booking);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy chi tiết booking: {ex.Message}", ex);
            }
        }

        public async Task<Booking?> GetBookingEntityByIdAsync(int bookingId)
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Field)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy booking entity: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldBookingSchedule>> GetBookedSlotsByBookingIdAsync(int bookingId)
        {
            try
            {
                var bookedSlots = await _context.FieldBookingSchedules
                    .Where(s => s.BookingId == bookingId)
                    .ToListAsync();

                return bookedSlots;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách slot đã book: {ex.Message}", ex);
            }
        }

        private void ValidateBookingInput(BookingCreateDTO bookingDto)
        {

            // Validate selected slots
            if (!bookingDto.SelectedSlotIds.Any())
                throw new ArgumentException("Phải chọn ít nhất 1 slot thời gian");

            // Validate user vs guest
            if (!bookingDto.UserId.HasValue)
            {
                // Chỉ yêu cầu thông tin guest khi không có customer
                if (string.IsNullOrEmpty(bookingDto.GuestName) || string.IsNullOrEmpty(bookingDto.GuestPhone))
                    throw new ArgumentException("Cần có thông tin guest (tên và số điện thoại) khi không có user");
            }
            // Nếu có UserId thì sử dụng thông tin user, bỏ qua guest info
        }

        public async Task<bool> CheckTimeSlotAvailabilityAsync(int fieldId, DateOnly date, TimeOnly startTime, TimeOnly endTime)
        {
            try
            {
                // Kiểm tra slot trong Field_booking_schedule có available không
                var existingSlot = await _context.FieldBookingSchedules
                    .FirstOrDefaultAsync(s => s.FieldId == fieldId &&
                                             s.Date == date &&
                                             s.StartTime == startTime &&
                                             s.EndTime == endTime);

                // Nếu không có slot nào thì không available
                if (existingSlot == null)
                    return false;

                // Slot available nếu chưa có BookingId hoặc Status là Available
                return existingSlot.BookingId == null || existingSlot.Status == "Available";
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi kiểm tra slot availability: {ex.Message}", ex);
            }
        }

        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            // Check Slot dddddd
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Orders)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);
                if (booking == null)
                {
                    return false;
                }
                booking.Status = "Cancelled";
                booking.StatusPayment = "Cancelled";

                var scheduleSlots = await _context.FieldBookingSchedules
                    .Where(s => s.BookingId == bookingId)
                    .ToListAsync();
                foreach (var slot in scheduleSlots)
                {
                    slot.BookingId = null;
                    slot.Status = "Available";
                    slot.Notes = null;
                }

                _context.FieldBookingSchedules.UpdateRange(scheduleSlots);
                _context.Bookings.Update(booking);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception(ex.Message);
            }
        }

        public async Task<bool> DeleteBookingAsync(int bookingId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Orders)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);
                if (booking == null)
                {
                    return false;
                }

                // Giải phóng slots
                var scheduleSlots = await _context.FieldBookingSchedules
                    .Where(s => s.BookingId == bookingId)
                    .ToListAsync();
                foreach (var slot in scheduleSlots)
                {
                    slot.BookingId = null;
                    slot.Status = "Available";
                    slot.Notes = null;
                }

                // Xóa booking hoàn toàn
                _context.FieldBookingSchedules.UpdateRange(scheduleSlots);
                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<BookingResponseDTO>> GetBookingsByUserAsync(int userId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Fac)
                    .Include(b => b.Field)
                        .ThenInclude(f => f.FieldPricings)
                    .Include(b => b.UIdNavigation)
                        .ThenInclude(u => u.Customer)
                    .Include(b => b.FieldBookingSchedules)
                    .Where(b => b.UId == userId)
                    .OrderByDescending(b => b.CreateAt)
                    .ToListAsync();

                return bookings.Select(BookingMapper.MapToBookingResponseDTO);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy booking theo user: {ex.Message}", ex);
            }
        }

        public async Task<FieldBookingSchedule?> GetFieldBookingScheduleByIdAsync(int scheduleId)
        {
            try
            {
                return await _context.FieldBookingSchedules
                    .Include(s => s.Field)
                    .FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy FieldBookingSchedule: {ex.Message}", ex);
            }
        }

        public async Task<Service?> GetServiceByIdAsync(int serviceId)
        {
            try
            {
                return await _context.Services
                    .FirstOrDefaultAsync(s => s.ServiceId == serviceId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Service: {ex.Message}", ex);
            }
        }

        public async Task<Discount?> GetDiscountByIdAsync(int discountId)
        {
            try
            {
                return await _context.Discounts
                    .FirstOrDefaultAsync(d => d.DiscountId == discountId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy Discount: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateBookingAsync(Booking booking)
        {
            try
            {
                _context.Bookings.Update(booking);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật booking: {ex.Message}", ex);
            }
        }
    }
}