using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("user/{userId}")]
        [SwaggerOperation(Summary = "Lấy tất cả notifications của user", Description = "Lấy danh sách tất cả notifications của user theo userId")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            try
            {
                var notifications = await _notificationService.GetNotificationsByUserIdAsync(userId);
                return Ok(new { success = true, data = notifications });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPut("mark-as-read/{notificationId}")]
        [SwaggerOperation(Summary = "Đánh dấu notification đã đọc", Description = "Đánh dấu một notification cụ thể đã được đọc")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                var result = await _notificationService.MarkAsReadAsync(notificationId);
                if (result)
                {
                    return Ok(new { success = true, message = "Đã đánh dấu notification đã đọc" });
                }
                return BadRequest(new { success = false, error = "Không tìm thấy notification" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPut("mark-all-as-read/{userId}")]
        [SwaggerOperation(Summary = "Đánh dấu tất cả notifications đã đọc", Description = "Đánh dấu tất cả notifications của user đã được đọc")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            try
            {
                var result = await _notificationService.MarkAllAsReadAsync(userId);
                if (result)
                {
                    return Ok(new { success = true, message = "Đã đánh dấu tất cả notifications đã đọc" });
                }
                return BadRequest(new { success = false, error = "Không thể đánh dấu notifications" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpDelete("{notificationId}")]
        [SwaggerOperation(Summary = "Xóa notification", Description = "Xóa một notification cụ thể")]
        public async Task<IActionResult> DeleteNotification(int notificationId)
        {
            try
            {
                var result = await _notificationService.DeleteNotificationAsync(notificationId);
                if (result)
                {
                    return Ok(new { success = true, message = "Đã xóa notification" });
                }
                return BadRequest(new { success = false, error = "Không tìm thấy notification" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }
}
