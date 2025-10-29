namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO để tạo Order từ Booking
    /// </summary>
    public class OrderCreateDTO
    {
        public int BookingId { get; set; }
        public int? UId { get; set; }
        public int FacId { get; set; }
        public int? DiscountId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? StatusPayment { get; set; } = "Pending";
        public DateTime? CreateAt { get; set; }
    }

    /// <summary>
    /// DTO response cho Order
    /// </summary>
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public int? UId { get; set; }
        public int FacId { get; set; }
        public int? DiscountId { get; set; }
        public int? BookingId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? TotalServicePrice { get; set; }
        public string? ContentPayment { get; set; }
        public string? StatusPayment { get; set; }
        public DateTime? CreateAt { get; set; }

        public List<OrderDetailServiceDTO> Services { get; set; } = new List<OrderDetailServiceDTO>();
    }

    public class OrderDetailServiceDTO
    {
        public int ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class AddServiceToOrderDTO
    {
        public int OrderId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }

    public class RemoveServiceFromOrderDTO
    {
        public int OrderId { get; set; }
        public int ServiceId { get; set; }
    }

    public class OrderDetailByScheduleDTO
    {
        public int OrderId { get; set; }
        public int? UId { get; set; }
        public int FacId { get; set; }
        public int? DiscountId { get; set; }
        public int? BookingId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? TotalServicePrice { get; set; }
        public string? ContentPayment { get; set; }
        public string? StatusPayment { get; set; }
        public DateTime? CreateAt { get; set; }
        public OrderCustomerInfoDTO CustomerInfo { get; set; } = new OrderCustomerInfoDTO();
        public List<BookingSlotDTO> BookedSlots { get; set; } = new List<BookingSlotDTO>();
        public List<OrderDetailServiceDTO> Services { get; set; } = new List<OrderDetailServiceDTO>();
        public string? FacilityName { get; set; }
        public string? FacilityAddress { get; set; }
        public OrderDiscountInfoDTO? DiscountInfo { get; set; }
    }

    /// <summary>
    /// DTO thông tin khách hàng (User hoặc Guest)
    /// </summary>
    public class OrderCustomerInfoDTO
    {
        public string CustomerType { get; set; } = string.Empty; // "User" hoặc "Guest"
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    /// <summary>
    /// DTO thông tin slot đặt sân
    /// </summary>
    public class BookingSlotDTO
    {
        public int ScheduleId { get; set; }
        public int FieldId { get; set; }
        public string? FieldName { get; set; }
        public string? CategoryName { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public DateOnly Date { get; set; }
        public decimal? Price { get; set; }
        public string? Status { get; set; }
    }

    /// <summary>
    /// DTO thông tin discount
    /// </summary>
    public class OrderDiscountInfoDTO
    {
        public int DiscountId { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public string? Description { get; set; }
        public decimal? DiscountAmount { get; set; }
    }

    /// <summary>
    /// DTO đơn giản hiển thị thông tin khách hàng và thời gian đặt theo ScheduleId
    /// </summary>
    public class OrderSlotDetailDTO
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? Date { get; set; }
    }
}