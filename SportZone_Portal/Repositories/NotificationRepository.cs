using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repository.Interfaces;

namespace SportZone_API.Repository
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly SportZoneContext _context;

        public NotificationRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            try
            {
                notification.CreateAt = DateTime.Now;
                notification.IsRead = false;

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return notification;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo notification: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId)
        {
            try
            {
                return await _context.Notifications
                    .Where(n => n.UId == userId)
                    .OrderByDescending(n => n.CreateAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy notifications: {ex.Message}", ex);
            }
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.NotiId == notificationId);

                if (notification == null)
                    return false;

                notification.IsRead = true;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đánh dấu notification đã đọc: {ex.Message}", ex);
            }
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UId == userId && n.IsRead == false)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đánh dấu tất cả notifications đã đọc: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.NotiId == notificationId);

                if (notification == null)
                    return false;

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa notification: {ex.Message}", ex);
            }
        }
    }
}
