using SportZone_API.Models;

namespace SportZone_API.Repository.Interfaces
{
    public interface INotificationRepository
    {
        /// <summary>
        /// Tạo notification mới
        /// </summary>
        Task<Notification> CreateNotificationAsync(Notification notification);

        /// <summary>
        /// Lấy tất cả notification của user
        /// </summary>
        Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId);

        /// <summary>
        /// Đánh dấu notification đã đọc
        /// </summary>
        Task<bool> MarkAsReadAsync(int notificationId);

        /// <summary>
        /// Đánh dấu tất cả notification của user đã đọc
        /// </summary>
        Task<bool> MarkAllAsReadAsync(int userId);

        /// <summary>
        /// Xóa notification
        /// </summary>
        Task<bool> DeleteNotificationAsync(int notificationId);
    }
}
