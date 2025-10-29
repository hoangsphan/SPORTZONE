using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Threading.Tasks; 

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("{orderId}")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            try
            {
                var response = await _orderService.GetOrderByIdAsync(orderId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving order: {ex.Message}");
            }
        }

        [HttpPut("Order/{orderId}/Update/ContentPayment")]
        [RoleAuthorize("2,4")]

        public async Task<IActionResult> UpdateOrderContentPayment(int orderId, int option)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid data",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }
                var response = await _orderService.UpdateOrderContentPaymentAsync(orderId,option);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error updating order content payment: {ex.Message}");
            }
        }

        [HttpGet("Owner/{ownerId}/TotalRevenue")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOwnerTotalRevenue(
            int ownerId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? facilityId = null)
        {
            try
            {
                var revenueData = await _orderService.GetOwnerTotalRevenueAsync(ownerId, startDate, endDate, facilityId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy tổng doanh thu thành công",
                    data = revenueData
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
                    message = "Có lỗi xảy ra khi lấy tổng doanh thu",
                    error = ex.Message
                });
            }
        }

        [HttpGet("owner/{ownerId}/monthlyRevenue")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOwnerMonthlyRevenue(
            int ownerId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? facilityId = null)
        {
            try
            {
                var revenueData = await _orderService.GetOwnerTotalRevenueAsync(ownerId, startDate, endDate, facilityId);

                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê doanh thu theo tháng thành công",
                    data = new
                    {
                        ownerId = revenueData.OwnerId,
                        ownerName = revenueData.OwnerName,
                        monthlyRevenue = revenueData.MonthlyRevenue,
                        totalRevenue = revenueData.TotalRevenue,
                        period = new
                        {
                            startDate = revenueData.StartDate,
                            endDate = revenueData.EndDate
                        }
                    }
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
                    message = "Có lỗi xảy ra khi lấy thống kê doanh thu theo tháng",
                    error = ex.Message
                });
            }
        }

        [HttpGet("owner/{ownerId}/yearlyRevenue")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOwnerYearlyRevenue(
            int ownerId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? facilityId = null)
        {
            try
            {
                var revenueData = await _orderService.GetOwnerTotalRevenueAsync(ownerId, startDate, endDate, facilityId);

                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê doanh thu theo năm thành công",
                    data = new
                    {
                        ownerId = revenueData.OwnerId,
                        ownerName = revenueData.OwnerName,
                        yearlyRevenue = revenueData.YearlyRevenue,
                        totalRevenue = revenueData.TotalRevenue,
                        period = new
                        {
                            startDate = revenueData.StartDate,
                            endDate = revenueData.EndDate
                        }
                    }
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
                    message = "Có lỗi xảy ra khi lấy thống kê doanh thu theo năm",
                    error = ex.Message
                });
            }
        }

        [HttpGet("owner/{ownerId}/facility-revenue")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOwnerFacilityRevenue(
            int ownerId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var revenueData = await _orderService.GetOwnerTotalRevenueAsync(ownerId, startDate, endDate, null);

                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê doanh thu theo cơ sở thành công",
                    data = new
                    {
                        ownerId = revenueData.OwnerId,
                        ownerName = revenueData.OwnerName,
                        facilities = revenueData.Facilities,
                        totalRevenue = revenueData.TotalRevenue,
                        period = new
                        {
                            startDate = revenueData.StartDate,
                            endDate = revenueData.EndDate
                        }
                    }
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
                    message = "Có lỗi xảy ra khi lấy thống kê doanh thu theo cơ sở",
                    error = ex.Message
                });
            }
        }

        [HttpGet("schedule/{scheduleId}")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOrderByScheduleId(int scheduleId)
        {
            try
            {
                var orderDetail = await _orderService.GetOrderByScheduleIdAsync(scheduleId);

                if (orderDetail == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Không tìm thấy Order cho ScheduleId: {scheduleId}"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin chi tiết Order thành công",
                    data = orderDetail
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
                    message = "Có lỗi xảy ra khi lấy thông tin chi tiết Order",
                    error = ex.Message
                });
            }
        }

        [HttpGet("schedule/{scheduleId}/slot-detail")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOrderSlotDetailByScheduleId(int scheduleId)
        {
            try
            {
                var data = await _orderService.GetOrderSlotDetailByScheduleIdAsync(scheduleId);
                if (data == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy dữ liệu cho ScheduleId: {scheduleId}" });
                }

                return Ok(new { success = true, message = "Lấy chi tiết giờ đặt thành công", data });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Có lỗi xảy ra", error = ex.Message });
            }
        }
    }
}