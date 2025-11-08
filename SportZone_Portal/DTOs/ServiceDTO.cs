using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    // DTO chính cho Service
    public class ServiceDTO
    {
        public int ServiceId { get; set; }
        public int? FacId { get; set; }
        public string? ServiceName { get; set; }
        public decimal? Price { get; set; }
        public string? Status { get; set; }
        public string? Image { get; set; }
        public string? Description { get; set; }

        // Thông tin Facility liên quan
        public string? FacilityAddress { get; set; }
    }

    // DTO cho tạo Service mới
    public class CreateServiceDTO
    {
        [Required(ErrorMessage = "Facility ID là bắt buộc")]
        public int FacId { get; set; }

        [Required(ErrorMessage = "Tên dịch vụ là bắt buộc")]
        [StringLength(200, ErrorMessage = "Tên dịch vụ không được vượt quá 200 ký tự")]
        public string ServiceName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giá dịch vụ là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá dịch vụ phải lớn hơn 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [RegularExpression("^(Active|Inactive)$", ErrorMessage = "Trạng thái chỉ có thể là 'Active' hoặc 'Inactive'")]
        public string Status { get; set; } = "Active";

        public IFormFile? ImageFile { get; set; }

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }
    }

    // DTO cho cập nhật Service
    public class UpdateServiceDTO
    {
        public int? FacId { get; set; }

        [StringLength(200, ErrorMessage = "Tên dịch vụ không được vượt quá 200 ký tự")]
        public string? ServiceName { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá dịch vụ phải lớn hơn 0")]
        public decimal? Price { get; set; }

        [RegularExpression("^(Active|Inactive)$", ErrorMessage = "Trạng thái chỉ có thể là 'Active' hoặc 'Inactive'")]
        public string? Status { get; set; }

        public IFormFile? ImageFile { get; set; }

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        public bool RemoveImage { get; set; } = false;
    }

    // DTO phản hồi chi tiết với thông tin quan hệ
    public class ServiceResponseDTO
    {
        public int ServiceId { get; set; }
        public int? FacId { get; set; }
        public string? ServiceName { get; set; }
        public decimal? Price { get; set; }
        public string? Status { get; set; }
        public string? Image { get; set; }
        public string? Description { get; set; }

        // Thông tin Facility
        public FacilityInfoDTO? Facility { get; set; }

        // Số lượng đơn hàng đã sử dụng dịch vụ này
        public int OrderCount { get; set; }
    }

    // DTO thông tin cơ bản của Facility
    public class FacilityInfomationDTO
    {
        public int FacId { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
    }
}
