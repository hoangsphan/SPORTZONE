using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO để tạo OrderService mới
    /// </summary>
    public class OrderServiceCreateDTO
    {
        [Required(ErrorMessage = "Order ID là bắt buộc")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Service ID là bắt buộc")]
        public int ServiceId { get; set; }

        [Required(ErrorMessage = "Số lượng là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int Quantity { get; set; }
    }

    /// <summary>
    /// DTO để cập nhật OrderService
    /// </summary>
    public class OrderServiceUpdateDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int? Quantity { get; set; }
    }

    /// <summary>
    /// DTO response cho OrderService
    public class OrderServiceDTO
    {
        public int OrderServiceId { get; set; }
        public int OrderId { get; set; }
        public int ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public string? ServiceImage { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPrice { get; set; }
    }

    /// <summary>
    /// DTO để tính toán tổng tiền service
    /// </summary>
    public class OrderServiceTotalDTO
    {
        public int OrderId { get; set; }
        public decimal TotalServicePrice { get; set; }
        public List<OrderServiceDTO> Services { get; set; } = new List<OrderServiceDTO>();
    }
}
