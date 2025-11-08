using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public sealed class BookingService : IBookingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<BookingService> _logger;
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public BookingService(HttpClient httpClient, ILogger<BookingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<BookingResponseModel?> CreateBookingAsync(BookingRequestModel request, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("api/Booking/CreateBooking", request, SerializerOptions, cancellationToken);
            response.EnsureSuccessStatusCode();

            var envelope = await response.Content.ReadFromJsonAsync<ApiResponse<BookingResponseModel>>(SerializerOptions, cancellationToken);
            return envelope?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create booking.");
            throw;
        }
    }

    public async Task<IReadOnlyList<BookingResponseModel>> GetBookingHistoryAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/Booking/user/{userId}", cancellationToken);
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return Array.Empty<BookingResponseModel>();
            }
            response.EnsureSuccessStatusCode();
            var envelope = await response.Content.ReadFromJsonAsync<ApiResponse<List<BookingResponseModel>>>(SerializerOptions, cancellationToken);
            return (IReadOnlyList<BookingResponseModel>)(envelope?.Data ?? new List<BookingResponseModel>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch booking history for user {UserId}", userId);
            return Array.Empty<BookingResponseModel>();
        }
    }
}
