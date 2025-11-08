using System.Text.Json.Serialization;

namespace SportZone_Blazor.Models;

public sealed class OrderModel
{
    [JsonPropertyName("orderId")]
    public int OrderId { get; set; }

    [JsonPropertyName("uId")]
    public int? UserId { get; set; }

    [JsonPropertyName("facId")]
    public int FacilityId { get; set; }

    [JsonPropertyName("discountId")]
    public int? DiscountId { get; set; }

    [JsonPropertyName("bookingId")]
    public int? BookingId { get; set; }

    [JsonPropertyName("guestName")]
    public string? GuestName { get; set; }

    [JsonPropertyName("guestPhone")]
    public string? GuestPhone { get; set; }

    [JsonPropertyName("totalPrice")]
    public decimal? TotalPrice { get; set; }

    [JsonPropertyName("totalServicePrice")]
    public decimal? TotalServicePrice { get; set; }

    [JsonPropertyName("contentPayment")]
    public string? ContentPayment { get; set; }

    [JsonPropertyName("statusPayment")]
    public string? StatusPayment { get; set; }

    [JsonPropertyName("createAt")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("services")]
    public List<OrderServiceLineModel> Services { get; set; } = new();
}

public sealed class OrderServiceLineModel
{
    [JsonPropertyName("serviceId")]
    public int ServiceId { get; set; }

    [JsonPropertyName("serviceName")]
    public string? ServiceName { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("quantity")]
    public int? Quantity { get; set; }

    [JsonPropertyName("imageUrl")]
    public string? ImageUrl { get; set; }
}

public sealed class OwnerRevenueModel
{
    [JsonPropertyName("ownerId")]
    public int OwnerId { get; set; }

    [JsonPropertyName("ownerName")]
    public string? OwnerName { get; set; }

    [JsonPropertyName("totalRevenue")]
    public decimal TotalRevenue { get; set; }

    [JsonPropertyName("monthlyRevenue")]
    public Dictionary<string, decimal>? MonthlyRevenue { get; set; }

    [JsonPropertyName("yearlyRevenue")]
    public Dictionary<string, decimal>? YearlyRevenue { get; set; }

    [JsonPropertyName("facilities")]
    public List<FacilityRevenueModel>? Facilities { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime? EndDate { get; set; }
}

public sealed class FacilityRevenueModel
{
    [JsonPropertyName("facilityId")]
    public int FacilityId { get; set; }

    [JsonPropertyName("facilityName")]
    public string? FacilityName { get; set; }

    [JsonPropertyName("totalRevenue")]
    public decimal TotalRevenue { get; set; }
}
