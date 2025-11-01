using System.Text.Json.Serialization;

namespace SportZone_Blazor.Models;

public sealed class BookingRequestModel
{
    [JsonPropertyName("userId")]
    public int? UserId { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("selectedSlotIds")]
    public List<int> SelectedSlotIds { get; set; } = new();

    [JsonPropertyName("fieldId")]
    public int? FieldId { get; set; }

    [JsonPropertyName("facilityId")]
    public int? FacilityId { get; set; }

    [JsonPropertyName("guestName")]
    public string? GuestName { get; set; }

    [JsonPropertyName("guestPhone")]
    public string? GuestPhone { get; set; }

    [JsonPropertyName("serviceIds")]
    public List<int>? ServiceIds { get; set; }

    [JsonPropertyName("discountId")]
    public int? DiscountId { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }
}

public sealed class BookingResponseModel
{
    [JsonPropertyName("bookingId")]
    public int BookingId { get; set; }

    [JsonPropertyName("fieldId")]
    public int FieldId { get; set; }

    [JsonPropertyName("fieldName")]
    public string? FieldName { get; set; }

    [JsonPropertyName("facilityName")]
    public string? FacilityName { get; set; }

    [JsonPropertyName("facilityAddress")]
    public string? FacilityAddress { get; set; }

    [JsonPropertyName("userId")]
    public int? UserId { get; set; }

    [JsonPropertyName("customerName")]
    public string? CustomerName { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("date")]
    public DateOnly? Date { get; set; }

    [JsonPropertyName("startTime")]
    public TimeOnly? StartTime { get; set; }

    [JsonPropertyName("endTime")]
    public TimeOnly? EndTime { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("statusPayment")]
    public string? StatusPayment { get; set; }

    [JsonPropertyName("createAt")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("guestName")]
    public string? GuestName { get; set; }

    [JsonPropertyName("guestPhone")]
    public string? GuestPhone { get; set; }

    [JsonPropertyName("fieldPrice")]
    public decimal? FieldPrice { get; set; }

    [JsonPropertyName("totalAmount")]
    public decimal? TotalAmount { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("services")]
    public List<BookingServiceModel>? Services { get; set; }
}

public sealed class BookingServiceModel
{
    [JsonPropertyName("serviceId")]
    public int ServiceId { get; set; }

    [JsonPropertyName("serviceName")]
    public string? ServiceName { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("quantity")]
    public int? Quantity { get; set; }

    [JsonPropertyName("totalPrice")]
    public decimal? TotalPrice { get; set; }
}
