using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Net;

namespace SportZone_API.Services
{
    public class VNPayService : IVNPayService
    {
        private readonly IConfiguration _configuration;
        private readonly string _tmnCode;
        private readonly string _hashSecret;
        private readonly string _paymentUrl;

        public VNPayService(IConfiguration configuration)
        {
            _configuration = configuration;
            _tmnCode = "HDWPLNN5"; // Terminal ID
            _hashSecret = "RYJE8DNUWL15UQJV7PDEDBC3P5IW3FCJ"; // Secret Key
            _paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"; // Payment URL
        }

        public async Task<ServiceResponse<VNPayResponseDto>> CreatePaymentUrl(VNPayRequestDto request)
        {
            try
            {
                var ipAddress = "127.0.0.1"; // Có thể lấy từ HttpContext
                var paymentUrl = CreatePaymentUrl(request, ipAddress);

                var response = new VNPayResponseDto
                {
                    PaymentUrl = paymentUrl,
                    OrderId = request.OrderId,
                    Amount = request.Amount,
                    OrderInfo = request.OrderInfo
                };

                return new ServiceResponse<VNPayResponseDto>
                {
                    Success = true,
                    Message = "Tạo URL thanh toán thành công.",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<VNPayResponseDto>
                {
                    Success = false,
                    Message = $"Lỗi khi tạo URL thanh toán: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<bool>> VerifyPaymentReturn(VNPayReturnDto returnData)
        {
            try
            {
                var ipAddress = "127.0.0.1"; // Có thể lấy từ HttpContext
                var isValid = VerifyPaymentReturn(returnData, ipAddress);

                return new ServiceResponse<bool>
                {
                    Success = true,
                    Message = isValid ? "Xác thực thanh toán thành công." : "Xác thực thanh toán thất bại.",
                    Data = isValid
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<bool>
                {
                    Success = false,
                    Message = $"Lỗi khi xác thực thanh toán: {ex.Message}",
                    Data = false
                };
            }
        }

        public string CreatePaymentUrl(VNPayRequestDto request, string ipAddress)
        {
            VnPayLibrary vnpay = new VnPayLibrary();

            vnpay.AddRequestData("vnp_Version", VnPayLibrary.VERSION);
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", _tmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)(request.Amount * 100)).ToString());
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_BankCode", "");
            vnpay.AddRequestData("vnp_TxnRef", request.OrderId);
            vnpay.AddRequestData("vnp_OrderInfo", request.OrderInfo);
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_ReturnUrl", request.ReturnUrl);
            vnpay.AddRequestData("vnp_IpAddr", ipAddress);
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss"));

            string paymentUrl = vnpay.CreateRequestUrl(_paymentUrl, _hashSecret);
            
            Console.WriteLine($"VNPay URL: {paymentUrl}");
            
            return paymentUrl;
        }

        public bool VerifyPaymentReturn(VNPayReturnDto returnData, string ipAddress)
        {
            VnPayLibrary vnpay = new VnPayLibrary();

            vnpay.AddResponseData("vnp_Version", "2.1.0");
            vnpay.AddResponseData("vnp_Command", "pay");
            vnpay.AddResponseData("vnp_TmnCode", _tmnCode);
            vnpay.AddResponseData("vnp_Amount", returnData.vnp_Amount);
            vnpay.AddResponseData("vnp_CurrCode", "VND");
            vnpay.AddResponseData("vnp_BankCode", returnData.vnp_BankCode);
            vnpay.AddResponseData("vnp_TxnRef", returnData.vnp_TxnRef);
            vnpay.AddResponseData("vnp_OrderInfo", returnData.vnp_OrderInfo);
            vnpay.AddResponseData("vnp_OrderType", "other");
            vnpay.AddResponseData("vnp_Locale", "vn");
            vnpay.AddResponseData("vnp_ReturnUrl", "https://localhost:7000/api/Payment/vnpay-return");
            vnpay.AddResponseData("vnp_IpAddr", ipAddress);
            vnpay.AddResponseData("vnp_ResponseCode", returnData.vnp_ResponseCode);
            vnpay.AddResponseData("vnp_TransactionNo", returnData.vnp_TransactionNo);
            vnpay.AddResponseData("vnp_TransactionStatus", returnData.vnp_TransactionStatus);
            vnpay.AddResponseData("vnp_PayDate", returnData.vnp_PayDate);
            vnpay.AddResponseData("vnp_SecureHash", returnData.vnp_SecureHash);

            return vnpay.ValidateResponse(_hashSecret);
        }


    }
} 