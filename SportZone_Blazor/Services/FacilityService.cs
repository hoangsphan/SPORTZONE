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
            return facilities ?? Array.Empty<FacilitySummaryModel>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch facilities.");
            return Array.Empty<FacilitySummaryModel>();
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
}
