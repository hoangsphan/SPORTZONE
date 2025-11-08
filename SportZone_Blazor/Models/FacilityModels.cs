using System.Text.Json.Serialization;

namespace SportZone_Blazor.Models;

public sealed class CategoryFieldModel
{
    [JsonPropertyName("categoryFieldId")]
    public int CategoryFieldId { get; set; }

    [JsonPropertyName("categoryFieldName")]
    public string CategoryFieldName { get; set; } = string.Empty;
}

public class FacilitySummaryModel
{
    [JsonPropertyName("facId")]
    public int FacilityId { get; set; }

    [JsonPropertyName("userId")]
    public int OwnerUserId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("openTime")]
    public string? OpenTime { get; set; }

    [JsonPropertyName("closeTime")]
    public string? CloseTime { get; set; }

    [JsonPropertyName("address")]
    public string? Address { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("subdescription")]
    public string? Subdescription { get; set; }

    [JsonPropertyName("imageUrls")]
    public List<string> ImageUrls { get; set; } = new();

    [JsonPropertyName("categoryFields")]
    public List<CategoryFieldModel> CategoryFields { get; set; } = new();
}

public sealed class FacilityDetailModel : FacilitySummaryModel
{
    [JsonPropertyName("fields")]
    public List<FieldSummaryModel> Fields { get; set; } = new();
}
