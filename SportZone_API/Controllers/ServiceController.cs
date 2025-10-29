using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;
        private readonly IOrderServiceService _orderServiceService;
        public ServiceController(IServiceService serviceService, IOrderServiceService orderServiceService)
        {
            _serviceService = serviceService;
            _orderServiceService = orderServiceService;
        }

        [HttpGet("GetAllService")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllServices()
        {
            try
            {
                var services = await _serviceService.GetAllServicesAsync();
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách dịch vụ thành công",
                    data = services,
                    count = services.Count()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy danh sách dịch vụ",
                    error = ex.Message
                });
            }
        }

        [HttpGet("GetServiceById/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetServiceById(int id)
        {
            try
            {
                var service = await _serviceService.GetServiceByIdAsync(id);
                if (service == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Dịch vụ không tồn tại"
                    });
                }
                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin dịch vụ thành công",
                    data = service
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy thông tin dịch vụ",
                    error = ex.Message
                });
            }
        }

        [HttpGet("facility/{facilityId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetServicesByFacilityId(int facilityId)
        {
            try
            {
                var services = await _serviceService.GetServicesByFacilityIdAsync(facilityId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách dịch vụ theo Facility ID thành công",
                    data = services,
                    count = services.Count()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi lấy danh sách dịch vụ theo Facility ID",
                    error = ex.Message
                });
            }
        }

        [HttpGet("status/{status}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetServicesByStatus(string status)
        {
            try
            {
                var services = await _serviceService.GetServicesByStatusAsync(status);
                return Ok(new
                {
                    success = true,
                    message = $"Lấy danh sách dịch vụ có trạng thái '{status}' thành công",
                    data = services,
                    count = services.Count()
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
                    message = "Có lỗi xảy ra khi lấy danh sách dịch vụ theo trạng thái",
                    error = ex.Message
                });
            }
        }

        [HttpPost("Add/Service")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> CreateService([FromForm] CreateServiceDTO createServiceDTO)
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

                var service = await _serviceService.CreateServiceAsync(createServiceDTO);
                return CreatedAtAction(nameof(GetServiceById), new { id = service.ServiceId }, new
                {
                    success = true,
                    message = "Tạo dịch vụ thành công",
                    data = service
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi tạo dịch vụ",
                    error = ex.Message
                });
            }
        }

        [HttpPut("UpdateService/{id}")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> UpdateService(int id, [FromForm] UpdateServiceDTO updateServiceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var service = await _serviceService.UpdateServiceAsync(id, updateServiceDto);
                if (service == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy dịch vụ để cập nhật"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật dịch vụ thành công",
                    data = service
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
                    message = "Có lỗi xảy ra khi cập nhật dịch vụ",
                    error = ex.Message
                });
            }
        }

        [HttpDelete("DeleteService/{id}")]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> DeleteService(int id)
        {
            try
            {
                var result = await _serviceService.DeleteServiceAsync(id);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy dịch vụ để xóa"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Xóa dịch vụ thành công"
                });
            }
            catch (InvalidOperationException ex)
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
                    message = "Có lỗi xảy ra khi xóa dịch vụ",
                    error = ex.Message
                });
            }
        }

        [HttpGet("pagination")]
        [AllowAnonymous]
        public async Task<IActionResult> GetServicesWithPagination([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (services, totalCount) = await _serviceService.GetServicesWithPaginationAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách dịch vụ với phân trang thành công",
                    data = services,
                    pagination = new
                    {
                        currentPage = pageNumber,
                        pageSize,
                        totalCount,
                        totalPages,
                        hasNextPage = pageNumber < totalPages,
                        hasPreviousPage = pageNumber > 1
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
                    message = "Có lỗi xảy ra khi lấy danh sách dịch vụ với phân trang",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Thêm service vào order
        /// </summary>
        [HttpPost("order/add")]
        public async Task<IActionResult> AddServiceToOrder([FromBody] OrderServiceCreateDTO orderServiceDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var orderService = await _orderServiceService.AddServiceToOrderAsync(orderServiceDto);

                return Ok(new
                {
                    success = true,
                    message = "Thêm service vào order thành công",
                    data = orderService
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
                    message = "Có lỗi xảy ra khi thêm service vào order",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Xóa service khỏi order
        /// </summary>
        [HttpDelete("order/{orderServiceId}/remove")]
        public async Task<IActionResult> RemoveServiceFromOrder(int orderServiceId)
        {
            try
            {
                var result = await _orderServiceService.RemoveServiceFromOrderAsync(orderServiceId);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy OrderService để xóa"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Xóa service khỏi order thành công"
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
                    message = "Có lỗi xảy ra khi xóa service khỏi order",
                    error = ex.Message
                });
            }
        }


        [HttpGet("order/{orderId}/services")]
        //[AllowAnonymous]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> GetOrderServices(int orderId)
        {
            try
            {
                var orderServices = await _orderServiceService.GetOrderServicesByOrderIdAsync(orderId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách dịch vụ trong order thành công",
                    data = orderServices,
                    count = orderServices.Count()
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
                    message = "Có lỗi xảy ra khi lấy danh sách dịch vụ trong order",
                    error = ex.Message
                });
            }
        }

        [HttpPut("order/{orderServiceId}/update/Service/Quantity")]
        //[AllowAnonymous]
        [RoleAuthorize("2,4")]
        public async Task<IActionResult> UpdateOrderServiceAsync(int orderServiceId, [FromBody] OrderServiceUpdateDTO updateDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var orderService = await _orderServiceService.UpdateOrderServiceAsync(orderServiceId, updateDTO);
                if (orderService == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy OrderService để cập nhật"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật số lượng dịch vụ trong order thành công",
                    data = orderService
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
                    message = "Có lỗi xảy ra khi cập nhật OrderService",
                    error = ex.Message
                });
            }
        }
    }
}
