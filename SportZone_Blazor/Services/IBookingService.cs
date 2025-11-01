using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public interface IBookingService
{
    Task<BookingResponseModel?> CreateBookingAsync(BookingRequestModel request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BookingResponseModel>> GetBookingHistoryAsync(int userId, CancellationToken cancellationToken = default);
}
