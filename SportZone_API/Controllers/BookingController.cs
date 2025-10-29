using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.DTOs;
using SportZone_API.Repository.Interfaces;
using Microsoft.AspNetCore.Authorization;
using SportZone_API.Attributes;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IOrderService _orderService;
        private readonly IOrderFieldIdService _orderFieldIdService;
        private readonly IFieldService _fieldService;
        public BookingController(IBookingService bookingService,
                                 IOrderService orderService,
                                 IOrderFieldIdService orderFieldIdService,
                                 IFieldService fieldService)
        {
            _bookingService = bookingService;
            _orderService = orderService;
            _orderFieldIdService = orderFieldIdService;
            _fieldService = fieldService;
        }

        [HttpPost("CreateBooking")]
        [AllowAnonymous]
        [RoleAuthorize("1,2,4")]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDTO bookingDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                var booking = await _bookingService.CreateBookingAsync(bookingDto);
                // Tự động tạo Order và OrderFieldId khi Booking thành công
                try
                {
                    // Lấy booking entity để truyền cho OrderService
                    var bookingEntity = await _bookingService.GetBookingDetailAsync(booking.BookingId);
                    if (bookingEntity != null)
                    {
                        var fieldinfo = await _fieldService.GetFieldEntityByIdAsync(booking.FieldId);
                        var facilityId = fieldinfo?.FacId;
                        // Tạo Order từ Booking
                        var bookingModel = new Booking
                        {
                            BookingId = booking.BookingId,
                            FieldId = booking.FieldId,
                            UId = booking.UserId,
                            GuestName = booking.GuestName,
                            GuestPhone = booking.GuestPhone,
                            CreateAt = booking.CreateAt,
                            Field = new Field { FacId = facilityId }
                        };

                        var order = await _orderService.CreateOrderFromBookingAsync(bookingModel, bookingDto.DiscountId);

                        // Tạo OrderFieldId linking Order với Field
                        await _orderFieldIdService.CreateOrderFieldIdAsync(order.OrderId, booking.FieldId);
                    }
                }
                catch (Exception orderEx)
                {
                    Console.WriteLine($"Lỗi khi tạo Order/OrderFieldId: {orderEx.Message}");
                }
                return CreatedAtAction(nameof(GetBookingDetail), new { id = booking.BookingId }, new
                {
                    success = true,
                    message = "Tạo booking thành công",
                    data = booking
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpGet("GetBookingById/{id}")]
        [RoleAuthorize("3,2,4")]
        public async Task<IActionResult> GetBookingDetail(int id)
        {
            try
            {
                var booking = await _bookingService.GetBookingDetailAsync(id);
                if (booking == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy booking"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy chi tiết booking thành công",
                    data = booking
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpDelete("CancelBooking/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                var result = await _bookingService.CancelBookingAsync(id);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy booking hoặc không thể hủy"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Hủy booking thành công"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpGet("user/{userId}")]
        [RoleAuthorize("1,2,3,4")]
        public async Task<IActionResult> GetUserBookings(int userId)
        {
            try
            {
                var bookings = await _bookingService.GetUserBookingsAsync(userId);
                if (bookings == null || !bookings.Any())
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy booking cho khách hàng này"
                    });
                }
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách booking thành công",
                    data = bookings,
                    count = bookings.Count(),
                    usersId = userId
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }
    }
}