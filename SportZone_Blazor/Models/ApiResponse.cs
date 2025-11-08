using System.Text.Json.Serialization;

// Models/ApiResponse.cs
namespace SportZone_Blazor.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public int? Count { get; set; }
}
