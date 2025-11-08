using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class CreateAccountDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password là bắt buộc")]
        [MinLength(6, ErrorMessage = "Password phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "RoleId là bắt buộc")]
        public int RoleId { get; set; }

        [Required(ErrorMessage = "Name là bắt buộc")]
        public string Name { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Status { get; set; } = "Active";

        // Specific for Staff role
        public int? FacilityId { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Image { get; set; }
    }
} 