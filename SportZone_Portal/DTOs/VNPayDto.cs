using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    public class VNPayRequestDto
    {
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public string OrderId { get; set; }
        
        [Required]
        public string OrderInfo { get; set; }
        
        public string ReturnUrl { get; set; } = "https://localhost:7000/api/Payment/vnpay-return";
    }

    public class VNPayResponseDto
    {
        public string PaymentUrl { get; set; }
        public string OrderId { get; set; }
        public decimal Amount { get; set; }
        public string OrderInfo { get; set; }
    }

    public class VNPayReturnDto
    {
        public string vnp_TxnRef { get; set; }
        public string vnp_Amount { get; set; }
        public string vnp_OrderInfo { get; set; }
        public string vnp_ResponseCode { get; set; }
        public string vnp_TransactionNo { get; set; }
        public string vnp_BankCode { get; set; }
        public string vnp_PayDate { get; set; }
        public string vnp_TransactionStatus { get; set; }
        public string vnp_SecureHash { get; set; }
    }

    /// <summary>
    /// DTO để lưu booking data tạm thời cho VNPay callback
    /// </summary>
    public class PendingBookingDto
    {
        public BookingCreateDTO BookingData { get; set; }
        public string OrderId { get; set; }
        public int BookingId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
} 