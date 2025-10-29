using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SportZone_API.DTOs
{
    public class GoogleLoginDTO
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("googleUserId")]
        public string GoogleUserId { get; set; } = string.Empty;

        [JsonPropertyName("accessToken")]
        public string AccessToken { get; set; } = string.Empty;
    }
}
