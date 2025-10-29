using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SportZone_API.Repositories.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SportZone_API.Services
{
    public class ScheduleStatusUpdaterService : BackgroundService
    {
        private readonly ILogger<ScheduleStatusUpdaterService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public ScheduleStatusUpdaterService(ILogger<ScheduleStatusUpdaterService> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Schedule Status Updater Service running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Checking for expired schedules...");
                await UpdateExpiredSchedules();
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken); // Chạy mỗi 30 phút
            }
        }

        private async Task UpdateExpiredSchedules()
        {
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var scheduleRepository = scope.ServiceProvider.GetRequiredService<IFieldBookingScheduleRepository>();

                    // Lấy tất cả lịch đã hết hạn
                    var now = DateTime.Now;
                    var expiredSchedules = (await scheduleRepository.GetAllSchedulesAsync())
                        .Where(s => s.Date < DateOnly.FromDateTime(now) || (s.Date == DateOnly.FromDateTime(now) && s.EndTime < TimeOnly.FromDateTime(now)))
                        .Where(s => s.Status == "Available") // Chỉ cập nhật những slot còn "Available"
                        .ToList();

                    if (expiredSchedules.Any())
                    {
                        foreach (var schedule in expiredSchedules)
                        {
                            schedule.Status = "Unavailable"; // Cập nhật trạng thái thành "Unavailable"
                        }

                        await scheduleRepository.UpdateRangeSchedulesAsync(expiredSchedules);
                        _logger.LogInformation($"Updated {expiredSchedules.Count} expired schedules to 'Unavailable'.");
                    }
                    else
                    {
                        _logger.LogInformation("No expired schedules to update.");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating expired schedules.");
            }
        }
    }
}