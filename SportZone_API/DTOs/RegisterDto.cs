using System;
using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Tên vai trò không được để trống.")]
        [StringLength(50, ErrorMessage = "Tên vai trò không được vượt quá 50 ký tự.")]
        public string RoleName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên không được để trống.")]
        [StringLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại không được để trống.")]
        [StringLength(20, MinimumLength = 10, ErrorMessage = "Số điện thoại phải từ 10 đến 20 ký tự.")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống.")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        [StringLength(255, MinimumLength = 10, ErrorMessage = "Mật khẩu phải dài ít nhất 10 ký tự.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Xác nhận mật khẩu không được để trống.")]
        [Compare("Password", ErrorMessage = "Mật khẩu và xác nhận mật khẩu không khớp.")]
        public string ConfirmPassword { get; set; } = string.Empty;

        // Các trường tùy chọn cho Staff
        public DateOnly? Dob { get; set; }

        public IFormFile? ImageFile { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "FacId phải là một số nguyên dương.")]
        public int? FacId { get; set; }
        public DateOnly? StartTime { get; set; }
        public DateOnly? EndTime { get; set; }
    }
}