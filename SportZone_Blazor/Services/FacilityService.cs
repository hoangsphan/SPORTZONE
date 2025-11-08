using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public sealed class FacilityService : IFacilityService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FacilityService> _logger;
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public FacilityService(HttpClient httpClient, ILogger<FacilityService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
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

    public async Task<FacilityDetailModel?> GetFacilityAsync(int facilityId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/Facility/{facilityId}", cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<FacilityDetailModel>(SerializerOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch facility {FacilityId}", facilityId);
            return null;
        }
    }

    public async Task<IReadOnlyList<FacilitySummaryModel>> GetFacilitiesAsync(string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var uri = "api/Facility/with-details";
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                uri = QueryHelpers.AddQueryString(uri, "searchText", searchTerm);
            }

            var response = await _httpClient.GetAsync(uri, cancellationToken);
            response.EnsureSuccessStatusCode();

            var facilities = await response.Content.ReadFromJsonAsync<List<FacilitySummaryModel>>(SerializerOptions, cancellationToken);
            return (IReadOnlyList<FacilitySummaryModel>)(facilities ?? new List<FacilitySummaryModel>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch facilities with search term: {SearchTerm}", searchTerm);
            throw;
        }
    }
}
