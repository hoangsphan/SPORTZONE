using System.Text.Json.Serialization;

namespace SportZone_Blazor.Models;

public sealed class FieldSummaryModel
{
    [JsonPropertyName("fieldId")]
    public int FieldId { get; set; }

    [JsonPropertyName("facId")]  // ✅ Đúng rồi
    public int? FacId { get; set; }  // ⚠️ Đổi tên property này

    [JsonPropertyName("facilityAddress")]
    public string? FacilityAddress { get; set; }

    [JsonPropertyName("categoryId")]
    public int? CategoryId { get; set; }

    [JsonPropertyName("categoryName")]
    public string? CategoryName { get; set; }

    [JsonPropertyName("fieldName")]
    public string? FieldName { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("isBookingEnable")]
    public bool? IsBookingEnable { get; set; }
}

public sealed class FieldScheduleModel
{
    [JsonPropertyName("scheduleId")]
    public int ScheduleId { get; set; }

    [JsonPropertyName("fieldId")]
    public int? FieldId { get; set; }

    [JsonPropertyName("fieldName")]
    public string? FieldName { get; set; }

    [JsonPropertyName("bookingId")]
    public int? BookingId { get; set; }

    [JsonPropertyName("bookingTitle")]
    public string? BookingTitle { get; set; }

    [JsonPropertyName("startTime")]
    public TimeOnly? StartTime { get; set; }

    [JsonPropertyName("endTime")]
    public TimeOnly? EndTime { get; set; }

    [JsonPropertyName("date")]
    public DateOnly? Date { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }

    [JsonPropertyName("guestName")]
    public string? GuestName { get; set; }

    [JsonPropertyName("guestPhone")]
    public string? GuestPhone { get; set; }
}