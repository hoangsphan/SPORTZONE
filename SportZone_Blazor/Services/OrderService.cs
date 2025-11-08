using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public sealed class OrderService : IOrderService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OrderService> _logger;
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public OrderService(HttpClient httpClient, ILogger<OrderService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<OrderModel?> GetOrderAsync(int orderId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"api/Order/{orderId}", cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<OrderModel>(SerializerOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch order {OrderId}", orderId);
            return null;
        }
    }

    public async Task<OwnerRevenueModel?> GetOwnerRevenueAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null, int? facilityId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var uri = $"api/Order/Owner/{ownerId}/TotalRevenue";
            var query = new Dictionary<string, string?>();

            if (startDate.HasValue)
            {
                query["startDate"] = startDate.Value.ToString("O");
            }

            if (endDate.HasValue)
            {
                query["endDate"] = endDate.Value.ToString("O");
            }

            if (facilityId.HasValue)
            {
                query["facilityId"] = facilityId.Value.ToString();
            }

            if (query.Count > 0)
            {
                uri = QueryHelpers.AddQueryString(uri, query);
            }

            var response = await _httpClient.GetAsync(uri, cancellationToken);
            response.EnsureSuccessStatusCode();

            var envelope = await response.Content.ReadFromJsonAsync<ApiResponse<OwnerRevenueModel>>(SerializerOptions, cancellationToken);
            return envelope?.Data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch owner revenue for owner {OwnerId}", ownerId);
            return null;
        }
    }
}
