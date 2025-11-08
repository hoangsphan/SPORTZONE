using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public sealed class FieldService : IFieldService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FieldService> _logger;

    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public FieldService(HttpClient httpClient, ILogger<FieldService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<IReadOnlyList<FieldSummaryModel>> GetFieldsAsync(string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var uri = "api/Field";
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                uri = QueryHelpers.AddQueryString("api/Field/GetAllFields/Search/", "search", searchTerm);
            }

            var response = await _httpClient.GetAsync(uri, cancellationToken);
            response.EnsureSuccessStatusCode();

            var envelope = await response.Content.ReadFromJsonAsync<ApiResponse<List<FieldSummaryModel>>>(SerializerOptions, cancellationToken);
            return (IReadOnlyList<FieldSummaryModel>)(envelope?.Data ?? new List<FieldSummaryModel>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch fields.");
            return Array.Empty<FieldSummaryModel>();
        }
    }

    public async Task<IReadOnlyList<FieldSummaryModel>> GetFieldsForFacilityAsync(int facilityId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/Field/facility/{facilityId}", cancellationToken);
            response.EnsureSuccessStatusCode();

            var envelope = await response.Content.ReadFromJsonAsync<ApiResponse<List<FieldSummaryModel>>>(SerializerOptions, cancellationToken);
            return (IReadOnlyList<FieldSummaryModel>)(envelope?.Data ?? new List<FieldSummaryModel>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch fields for facility {FacilityId}", facilityId);
            return Array.Empty<FieldSummaryModel>();
        }
    }

    public async Task<IReadOnlyList<FieldScheduleModel>> GetScheduleForFieldAsync(int fieldId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/Field/{fieldId}/schedule", cancellationToken);
            response.EnsureSuccessStatusCode();

            var envelope = await response.Content.ReadFromJsonAsync<ApiResponse<List<FieldScheduleModel>>>(SerializerOptions, cancellationToken);
            return (IReadOnlyList<FieldScheduleModel>)(envelope?.Data ?? new List<FieldScheduleModel>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch schedule for field {FieldId}", fieldId);
            return Array.Empty<FieldScheduleModel>();
        }
    }
}