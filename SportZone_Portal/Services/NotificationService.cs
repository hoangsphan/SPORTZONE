using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.Models;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Linq;

namespace SportZone_API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly SportZoneContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<SportZone_API.Hubs.NotificationHub> _hubContext;

        public NotificationService(INotificationRepository notificationRepository, SportZoneContext context, Microsoft.AspNetCore.SignalR.IHubContext<SportZone_API.Hubs.NotificationHub> hubContext)
        {
            _notificationRepository = notificationRepository;
            _context = context;
            _hubContext = hubContext;
        }

        public async Task CreateBookingSuccessNotificationAsync(Booking booking)
        {
            try
            {
                // Lấy thông tin chi tiết booking
                var bookingDetail = await _context.Bookings
                    .Include(b => b.Field)
                        .ThenInclude(f => f.Fac)
                    .Include(b => b.FieldBookingSchedules)
                    .Include(b => b.UIdNavigation)
                        .ThenInclude(u => u.Customer)
                    .FirstOrDefaultAsync(b => b.BookingId == booking.BookingId);

                if (bookingDetail == null)
                    return;

                // Tạo notification cho người đặt sân
                if (bookingDetail.UId.HasValue)
                {
                    var customerNotification = new Notification
                    {
                        UId = bookingDetail.UId.Value,
                        Type = "BookingSuccess",
                        Content = GenerateCustomerNotificationContent(bookingDetail)
                    };

                    await _notificationRepository.CreateNotificationAsync(customerNotification);
                }

                // Tạo notification cho chủ sân (FieldOwner)
                // Tìm FieldOwner thông qua Facility của Field
                var fieldOwner = await _context.FieldOwners
                    .Include(fo => fo.Facilities)
                    .FirstOrDefaultAsync(fo => fo.Facilities.Any(f => f.FacId == bookingDetail.Field.FacId));

                if (fieldOwner != null)
                {
                    var ownerNotification = new Notification
                    {
                        UId = fieldOwner.UId,
                        Type = "NewBooking",
                        Content = GenerateOwnerNotificationContent(bookingDetail)
                    };

                    await _notificationRepository.CreateNotificationAsync(ownerNotification);
                }
                    await _hubContext.Clients.All.SendAsync("ReceiveNotification", "Đặt sân thành công! Bạn đã đặt sân " + bookingDetail.Field?.FieldName + " vào ngày " + bookingDetail.Date?.ToString("dd/MM/yyyy") + ".");
            }
            catch (Exception ex)
            {
                // Log lỗi nhưng không throw để không ảnh hưởng đến booking
                Console.WriteLine($"Lỗi khi tạo notification: {ex.Message}");
            }
        }

        private string GenerateCustomerNotificationContent(Booking booking)
        {
            var facilityName = booking.Field?.Fac?.Name ?? "Không xác định";
            var fieldName = booking.Field?.FieldName ?? "Không xác định";
            var date = booking.Date?.ToString("dd/MM/yyyy") ?? "Không xác định";
            var timeRange = $"{booking.StartTime:HH:mm} - {booking.EndTime:HH:mm}";

            return $"Đặt sân thành công! Bạn đã đặt sân {fieldName} tại {facilityName} vào ngày {date} từ {timeRange}. Mã booking: #{booking.BookingId}";
        }

        private string GenerateOwnerNotificationContent(Booking booking)
        {
            var facilityName = booking.Field?.Fac?.Name ?? "Không xác định";
            var fieldName = booking.Field?.FieldName ?? "Không xác định";
            var date = booking.Date?.ToString("dd/MM/yyyy") ?? "Không xác định";
            var timeRange = $"{booking.StartTime:HH:mm} - {booking.EndTime:HH:mm}";
            var customerName = booking.UIdNavigation?.Customer?.Name ?? "Khách";

            return $"Có đặt sân mới! {customerName} đã đặt sân {fieldName} tại {facilityName} vào ngày {date} từ {timeRange}. Mã booking: #{booking.BookingId}";
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId)
        {
            return await _notificationRepository.GetNotificationsByUserIdAsync(userId);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            return await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            return await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId)
        {
            return await _notificationRepository.DeleteNotificationAsync(notificationId);
        }
    }
}
