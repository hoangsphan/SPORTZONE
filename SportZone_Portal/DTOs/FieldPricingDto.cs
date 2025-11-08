using System;
using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class FieldPricingDto
    {
        public int PricingId { get; set; }
        public int FieldId { get; set; }
        public TimeOnly StartTime { get; set; } 
        public TimeOnly EndTime { get; set; }   
        public decimal Price { get; set; }
    }

    public class FieldPricingCreateDto
    {
        [Required(ErrorMessage = "Mã sân là bắt buộc.")]
        public int FieldId { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu của khung giá là bắt buộc.")]
        public TimeOnly StartTime { get; set; } 

        [Required(ErrorMessage = "Thời gian kết thúc của khung giá là bắt buộc.")]
        public TimeOnly EndTime { get; set; } 

        [Required(ErrorMessage = "Giá cho khung giờ này là bắt buộc.")]
        [Range(0.01, (double)decimal.MaxValue, ErrorMessage = "Giá phải lớn hơn 0.")]
        public decimal Price { get; set; }
    }

    public class FieldPricingUpdateDto
    {
        public TimeOnly? StartTime { get; set; } 
        public TimeOnly? EndTime { get; set; }   

        [Range(0.01, (double)decimal.MaxValue, ErrorMessage = "Giá phải lớn hơn 0.")]
        public decimal? Price { get; set; }
    }
}