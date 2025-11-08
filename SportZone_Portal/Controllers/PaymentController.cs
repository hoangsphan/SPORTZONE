using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using SportZone_API.Models;
using SportZone_API.Services;
using Swashbuckle.AspNetCore.Annotations;
using SportZone_API.Repository.Interfaces;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class PaymentController : ControllerBase
    {
        private readonly IVNPayService _vnpayService;
        private readonly IBookingService _bookingService;
        private readonly IOrderService _orderService;
        private readonly IOrderFieldIdService _orderFieldIdService;
        private readonly IFieldService _fieldService;
        private readonly INotificationService _notificationService;

        public PaymentController(IVNPayService vnpayService, 
                               IBookingService bookingService,
                               IOrderService orderService,
                               IOrderFieldIdService orderFieldIdService,
                               IFieldService fieldService,
                               INotificationService notificationService)
        {
            _vnpayService = vnpayService;
            _bookingService = bookingService;
            _orderService = orderService;
            _orderFieldIdService = orderFieldIdService;
            _fieldService = fieldService;
            _notificationService = notificationService;
        }

        // Dictionary để lưu booking data tạm thời (trong thực tế nên dùng Redis hoặc database)
        private static readonly Dictionary<string, PendingBookingDto> _pendingBookings = new Dictionary<string, PendingBookingDto>();

        [HttpPost("calculate-and-pay")]
        [SwaggerOperation(Summary = "Tính toán tổng tiền và tạo URL thanh toán: Customer", Description = "Tính toán tổng tiền từ booking data và tạo URL thanh toán VNPay")]
        public async Task<IActionResult> CalculateAndPay([FromBody] BookingCreateDTO bookingData)
        {
            try
            {
                // Tính toán tổng tiền từ booking data
                var calculateResult = await _bookingService.CalculateTotalAmount(new CalculateAmountDTO
                {
                    SelectedSlotIds = bookingData.SelectedSlotIds,
                    ServiceIds = bookingData.ServiceIds,
                    DiscountId = bookingData.DiscountId
                });

                if (!calculateResult.Success)
                {
                    return BadRequest(new { error = calculateResult.Message });
                }

                
                string orderId = $"ORDER_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid().ToString().Substring(0, 8)}";

               
                var pendingBookingResult = await _bookingService.CreatePendingBookingAsync(bookingData, orderId);
                if (!pendingBookingResult.Success)
                {
                    return BadRequest(new { error = pendingBookingResult.Message });
                }

                decimal depositAmount = calculateResult.Data * 0.5m;

                
                var pendingBooking = new PendingBookingDto
                {
                    BookingData = bookingData,
                    OrderId = orderId,
                    BookingId = pendingBookingResult.Data.BookingId,
                    CreatedAt = DateTime.Now
                };
                _pendingBookings[orderId] = pendingBooking;

                
                var vnpayRequest = new VNPayRequestDto
                {
                    Amount = depositAmount,
                    OrderId = orderId,
                    OrderInfo = $"Dat coc dat san - {bookingData.Title ?? "Booking"}",
                    ReturnUrl = "https://localhost:7057/api/Payment/vnpay-return"
                };

                
                var paymentResult = await _vnpayService.CreatePaymentUrl(vnpayRequest);

                if (!paymentResult.Success)
                {
                    await _bookingService.CancelPendingBookingAsync(pendingBookingResult.Data.BookingId);
                    return BadRequest(new { error = paymentResult.Message });
                }

                return Ok(new
                {
                    success = true,
                    message = "Tính toán tiền đặt cọc và tạo URL thanh toán thành công. Booking tạm thời đã được tạo với ID " + pendingBookingResult.Data.BookingId,
                    totalAmount = calculateResult.Data,
                    depositAmount = depositAmount,
                    paymentUrl = paymentResult.Data.PaymentUrl,
                    orderId = paymentResult.Data.OrderId,
                    bookingId = pendingBookingResult.Data.BookingId,
                    expiresAt = DateTime.Now.AddMinutes(5)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau." });
            }
        }

        [HttpGet("vnpay-return")]     
        public async Task<IActionResult> VNPayReturn()
        {
            try
            {
                Console.WriteLine($"VNPay Return URL: {Request.QueryString}");
                
                //  query parameters 
                var vnpay = new VnPayLibrary();
                
                foreach (var param in Request.Query)
                {
                    if (!string.IsNullOrEmpty(param.Key) && param.Key.StartsWith("vnp_"))
                    {
                        vnpay.AddResponseData(param.Key, param.Value);
                    }
                }

                
                string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
                string vnp_TransactionStatus = vnpay.GetResponseData("vnp_TransactionStatus");
                string vnp_SecureHash = vnpay.GetResponseData("vnp_SecureHash");
                string vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");
                string vnp_Amount = vnpay.GetResponseData("vnp_Amount");
                string vnp_BankCode = vnpay.GetResponseData("vnp_BankCode");
                string vnp_TransactionNo = vnpay.GetResponseData("vnp_TransactionNo");

                Console.WriteLine($"Response Code: {vnp_ResponseCode}");
                Console.WriteLine($"Transaction Status: {vnp_TransactionStatus}");
                Console.WriteLine($"TxnRef: {vnp_TxnRef}");
                Console.WriteLine($"Amount: {vnp_Amount}");

                // Xác thực chữ ký
                bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, "RYJE8DNUWL15UQJV7PDEDBC3P5IW3FCJ");
                
                Console.WriteLine($"Signature Valid: {checkSignature}");

                if (checkSignature)
                {
                    if (vnp_ResponseCode == "00" && vnp_TransactionStatus == "00")
                    {
                        // Thanh toán thành công
                        Console.WriteLine("Thanh toán thành công!");
                        
                        // Tìm booking data từ OrderId
                        if (_pendingBookings.TryGetValue(vnp_TxnRef, out var pendingBooking))
                        {
                            try
                            {
                                // Xác nhận booking pending thành công
                                var confirmResult = await _bookingService.ConfirmBookingAsync(pendingBooking.BookingId);
                                if (!confirmResult)
                                {
                                    throw new Exception("Không thể xác nhận booking");
                                }

                                // Lấy booking entity để truyền cho OrderService
                                var bookingEntity = await _bookingService.GetBookingDetailAsync(pendingBooking.BookingId);
                                if (bookingEntity != null)
                                {
                                    var fieldinfo = await _fieldService.GetFieldEntityByIdAsync(bookingEntity.FieldId);
                                    var facilityId = fieldinfo?.FacId;
                                    // Tạo Order từ Booking
                                    var bookingModel = new Booking
                                    {
                                        BookingId = bookingEntity.BookingId,
                                        FieldId = bookingEntity.FieldId,
                                        UId = bookingEntity.UserId,
                                        GuestName = bookingEntity.GuestName,
                                        GuestPhone = bookingEntity.GuestPhone,
                                        CreateAt = bookingEntity.CreateAt,
                                        Field = new Field { FacId = facilityId }
                                    };

                                    var order = await _orderService.CreateOrderFromBookingAsync(bookingModel);

                                    // Tạo OrderFieldId linking Order với Field
                                    await _orderFieldIdService.CreateOrderFieldIdAsync(order.OrderId, bookingEntity.FieldId);
                                }

                                _pendingBookings.Remove(vnp_TxnRef);

                                Console.WriteLine($"Booking đã được xác nhận thành công! BookingId: {pendingBooking.BookingId}");
                                
                                // Tạo notification cho booking thành công
                                try
                                {
                                    var bookingForNotification = new Booking
                                    {
                                        BookingId = pendingBooking.BookingId,
                                        FieldId = bookingEntity.FieldId,
                                        UId = bookingEntity.UserId,
                                        GuestName = bookingEntity.GuestName,
                                        GuestPhone = bookingEntity.GuestPhone,
                                        Date = bookingEntity.Date,
                                        StartTime = bookingEntity.StartTime,
                                        EndTime = bookingEntity.EndTime,
                                        CreateAt = bookingEntity.CreateAt
                                    };
                                    
                                    await _notificationService.CreateBookingSuccessNotificationAsync(bookingForNotification);
                                    Console.WriteLine($"Đã tạo notification cho booking {pendingBooking.BookingId}");
                                }
                                catch (Exception notificationEx)
                                {
                                    Console.WriteLine($"Lỗi khi tạo notification: {notificationEx.Message}");
                                    // Không throw exception vì booking đã thành công
                                }
                                
                                // Redirect với thông tin booking // Sau có FE thì redirect sang các trang của FE
                                return Redirect($"http://localhost:5173/payment-success?bookingId={pendingBooking.BookingId}&message=Booking confirmed successfully");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Lỗi khi xác nhận booking: {ex.Message}");
                                // Hủy booking pending nếu xác nhận thất bại
                                await _bookingService.CancelPendingBookingAsync(pendingBooking.BookingId);
                                return Redirect("http://localhost:5173/payment-failed?error=Failed to confirm booking");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"Không tìm thấy booking data cho OrderId: {vnp_TxnRef}");
                            return Redirect("http://localhost:5173/payment-failed?error=Booking data not found");
                        }
                    }
                    else
                    {
                        // Thanh toán thất bại
                        Console.WriteLine($"Thanh toán thất bại. Response Code: {vnp_ResponseCode}");
                        
                        // Hủy booking pending khi thanh toán thất bại
                        if (_pendingBookings.TryGetValue(vnp_TxnRef, out var failedBooking))
                        {
                            await _bookingService.CancelPendingBookingAsync(failedBooking.BookingId);
                        }
                        
                        return Redirect("http://localhost:5173/payment-failed");
                    }
                }
                else
                {
                    // Chữ ký không hợp lệ
                    Console.WriteLine("Chữ ký không hợp lệ!");
                    return Redirect("http://localhost:5173/payment-failed");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi xử lý VNPay return: {ex.Message}");
                return Redirect("http://localhost:5173/payment-failed");
            }
        }
    }
} 