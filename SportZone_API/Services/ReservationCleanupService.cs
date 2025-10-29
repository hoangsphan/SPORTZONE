using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class ReservationCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReservationCleanupService> _logger;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(5); 

        public ReservationCleanupService(IServiceProvider serviceProvider, ILogger<ReservationCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("ReservationCleanupService đã được khởi động");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();
                    
                    await bookingService.CleanupExpiredPendingBookingsAsync();
                    
                    _logger.LogDebug("Đã thực hiện cleanup expired pending bookings");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi cleanup expired pending bookings");
                }

                await Task.Delay(_cleanupInterval, stoppingToken);
            }

            _logger.LogInformation("ReservationCleanupService đã được dừng");
        }
    }
} 