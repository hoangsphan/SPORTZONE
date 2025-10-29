using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO để tạo discount mới
    /// </summary>
    public class DiscountCreateDTO
    {
        [Required(ErrorMessage = "Facility ID là bắt buộc")]
        public int FacId { get; set; }

        [Required(ErrorMessage = "Phần trăm giảm giá là bắt buộc")]
        [Range(0, 100, ErrorMessage = "Phần trăm giảm giá phải từ 0 đến 100")]
        public decimal DiscountPercentage { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc")]
        public DateOnly StartDate { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc")]
        public DateOnly EndDate { get; set; }

        [MaxLength(500, ErrorMessage = "Mô tả không được quá 500 ký tự")]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int? Quantity { get; set; }
    }

    /// <summary>
    /// DTO để cập nhật discount
    /// </summary>
    public class DiscountUpdateDTO
    {
        public decimal? DiscountPercentage { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public int? Quantity { get; set; }
    }

    /// <summary>
    /// DTO response cho discount
    /// </summary>
    public class DiscountDTO
    {
        public int DiscountId { get; set; }
        public int FacId { get; set; }
        public string? FacilityName { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public int? Quantity { get; set; }
    }

    /// <summary>
    /// DTO để validate discount
    /// </summary>
    public class DiscountValidationDTO
    {
        public int DiscountId { get; set; }
        public int FacId { get; set; }
        public decimal DiscountPercentage { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public bool IsActive { get; set; }
        public int? Quantity { get; set; }
        public string? Description { get; set; }
    }
    public class DiscountDto
    {
        public int FacId { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public string? Description { get; set; }

        public bool? IsActive { get; set; }

        public int? Quantity { get; set; }
    }
}