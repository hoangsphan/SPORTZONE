using System;
using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class StaffDto
    {
        public int UId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateOnly? Dob { get; set; }
        public string? Image { get; set; }
        public int? FacId { get; set; }
        public DateOnly? StartTime { get; set; }
        public DateOnly? EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? FacilityName { get; set; }
    }

    public class UpdateStaffDto
    {
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        public string? Email { get; set; }

        public string? Status { get; set; }

        [StringLength(100, ErrorMessage = "Tên không được vượt quá 100 ký tự.")]
        public string? Name { get; set; }

        [Phone(ErrorMessage = "Định dạng số điện thoại không hợp lệ.")]
        [StringLength(20, MinimumLength = 10, ErrorMessage = "Số điện thoại phải từ 10 đến 20 ký tự.")]
        public string? Phone { get; set; }
        public DateOnly? Dob { get; set; }

        public IFormFile? ImageFile { get; set; }
        public bool RemoveImage { get; set; } = false;

        [Range(1, int.MaxValue, ErrorMessage = "FacId phải là một số nguyên dương.")]
        public int? FacId { get; set; }
        public DateOnly? StartTime { get; set; }
        public DateOnly? EndTime { get; set; }
    }
}