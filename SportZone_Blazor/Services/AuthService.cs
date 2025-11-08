using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace SportZone_Blazor.Services;

public sealed class AuthService : IAuthService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AuthService> _logger;
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public AuthService(HttpClient httpClient, ILogger<AuthService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            // The API expects [FromForm], try using FormUrlEncodedContent (application/x-www-form-urlencoded)
            // which is simpler and more compatible than multipart/form-data for simple text fields
            var formData = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "RoleName", request.RoleName },
                { "Name", request.Name },
                { "Phone", request.Phone },
                { "Email", request.Email },
                { "Password", request.Password },
                { "ConfirmPassword", request.ConfirmPassword }
            });

            var response = await _httpClient.PostAsync("api/Register", formData, cancellationToken);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<RegisterResult>(SerializerOptions, cancellationToken);
                return new RegisterResponse
                {
                    Success = true,
                    Message = result?.Message ?? "Đăng ký thành công"
                };
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Registration failed with status {StatusCode}. Response: {ErrorContent}", response.StatusCode, errorContent);
                
                // Try to parse different error formats
                string errorMessage = "Đã xảy ra lỗi khi đăng ký";
                
                try
                {
                    // Parse the JSON response
                    using var doc = JsonDocument.Parse(errorContent);
                    var root = doc.RootElement;
                    
                    // ASP.NET Core ModelState validation errors are in the "errors" property
                    // Format: { "type": "...", "title": "...", "status": 400, "traceId": "...", "errors": { "PropertyName": ["Error1", "Error2"] } }
                    if (root.TryGetProperty("errors", out var errorsProp) && errorsProp.ValueKind == JsonValueKind.Object)
                    {
                        var errorMessages = new List<string>();
                        foreach (var property in errorsProp.EnumerateObject())
                        {
                            if (property.Value.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var errorItem in property.Value.EnumerateArray())
                                {
                                    if (errorItem.ValueKind == JsonValueKind.String)
                                    {
                                        var errorText = errorItem.GetString();
                                        if (!string.IsNullOrEmpty(errorText))
                                        {
                                            errorMessages.Add(errorText);
                                        }
                                    }
                                }
                            }
                            else if (property.Value.ValueKind == JsonValueKind.String)
                            {
                                var errorText = property.Value.GetString();
                                if (!string.IsNullOrEmpty(errorText))
                                {
                                    errorMessages.Add(errorText);
                                }
                            }
                        }
                        
                        if (errorMessages.Any())
                        {
                            errorMessage = string.Join("; ", errorMessages);
                        }
                    }
                    // Try to get error or message fields (simple error format)
                    else if (root.TryGetProperty("error", out var errorProp) && errorProp.ValueKind == JsonValueKind.String)
                    {
                        errorMessage = errorProp.GetString() ?? errorMessage;
                    }
                    else if (root.TryGetProperty("message", out var messageProp) && messageProp.ValueKind == JsonValueKind.String)
                    {
                        errorMessage = messageProp.GetString() ?? errorMessage;
                    }
                    // Try direct ModelState format (object with property names as keys and arrays of errors as values)
                    else if (root.ValueKind == JsonValueKind.Object)
                    {
                        var errorMessages = new List<string>();
                        foreach (var property in root.EnumerateObject())
                        {
                            // Skip standard ASP.NET Core error properties
                            if (property.Name is "type" or "title" or "status" or "traceId")
                                continue;
                                
                            if (property.Value.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var errorItem in property.Value.EnumerateArray())
                                {
                                    if (errorItem.ValueKind == JsonValueKind.String)
                                    {
                                        var errorText = errorItem.GetString();
                                        if (!string.IsNullOrEmpty(errorText))
                                        {
                                            errorMessages.Add(errorText);
                                        }
                                    }
                                }
                            }
                            else if (property.Value.ValueKind == JsonValueKind.String)
                            {
                                var errorText = property.Value.GetString();
                                if (!string.IsNullOrEmpty(errorText))
                                {
                                    errorMessages.Add(errorText);
                                }
                            }
                        }
                        
                        if (errorMessages.Any())
                        {
                            errorMessage = string.Join("; ", errorMessages);
                        }
                    }
                }
                catch (JsonException)
                {
                    // If JSON parsing fails, try simple error object
                    try
                    {
                        var errorResult = System.Text.Json.JsonSerializer.Deserialize<RegisterErrorResult>(errorContent, SerializerOptions);
                        if (errorResult != null)
                        {
                            errorMessage = errorResult.Error ?? errorResult.Message ?? errorMessage;
                        }
                    }
                    catch
                    {
                        // If all parsing fails, use a portion of the raw content
                        if (!string.IsNullOrEmpty(errorContent) && errorContent.Length < 500)
                        {
                            errorMessage = errorContent;
                        }
                    }
                }

                return new RegisterResponse
                {
                    Success = false,
                    Message = errorMessage
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register user.");
            return new RegisterResponse
            {
                Success = false,
                Message = $"Đã xảy ra lỗi: {ex.Message}"
            };
        }
    }

    private class RegisterResult
    {
        public string Message { get; set; } = string.Empty;
    }

    private class RegisterErrorResult
    {
        public string? Error { get; set; }
        public string? Message { get; set; }
    }
}

