using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.Attributes;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Swashbuckle.AspNetCore.Annotations;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FacilityController : ControllerBase
    {
        private readonly IFacilityService _facilityService;

        public FacilityController(IFacilityService facilityService)
        {
            _facilityService = facilityService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] string? searchText)
        {
            try
            {
                var result = await _facilityService.GetAllFacilities(searchText);

                if (result.Success)
                {
                    return Ok(result.Data ?? Enumerable.Empty<FacilityDto>());
                }
                return BadRequest(new { error = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi lấy danh sách cơ sở. Vui lòng thử lại sau." });
            }
        }

        [HttpGet("with-details")]
        [AllowAnonymous]
        [SwaggerOperation(Summary = "Lấy các cơ sở lên Homepage bao gồm cả search text : Customer")]
        public async Task<IActionResult> GetAllWithDetails([FromQuery] string? searchText)
        {
            try
            {
                var result = await _facilityService.GetAllFacilitiesWithDetails(searchText);

                if (result.Success)
                {
                    return Ok(result.Data ?? Enumerable.Empty<FacilityDetailDto>());
                }
                return BadRequest(new { error = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi lấy danh sách cơ sở chi tiết. Vui lòng thử lại sau." });
            }
        }

        [HttpGet("filter")]
        [AllowAnonymous]
        [SwaggerOperation(Summary = "Lọc cơ sở theo Category Field và địa chỉ : Customer")]
        public async Task<IActionResult> GetFacilitiesByFilter(
            [FromQuery] string? categoryFieldName = null, 
            [FromQuery] string? address = null)
        {
            try
            {
                var result = await _facilityService.GetFacilitiesByFilter(categoryFieldName, address);

                if (result.Success)
                {
                    return Ok(result.Data ?? Enumerable.Empty<FacilityDetailDto>());
                }
                return BadRequest(new { error = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi lọc danh sách cơ sở. Vui lòng thử lại sau." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _facilityService.GetFacilityById(id);
                if (result == null)
                    return NotFound(new { message = $"Không tìm thấy cơ sở với ID {id}." }); 

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi lấy thông tin cơ sở. Vui lòng thử lại sau." }); 
            }
        }

        [HttpPost]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Create([FromForm] FacilityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var create = await _facilityService.CreateFacility(dto);
                if (create.Success)
                    return StatusCode(201, new { create.Message, create.Data });

                return BadRequest(new { create.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi tạo cơ sở. Vui lòng thử lại sau." }); 
            }
        }

        [HttpPut("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Update(int id, [FromForm] FacilityUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var update = await _facilityService.UpdateFacility(id, dto);
                if (update.Success)
                    return Ok(new { update.Message, update.Data });
                else
                {
                    return BadRequest(new { update.Message });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi cập nhật cơ sở. Vui lòng thử lại sau." });
            }
        }


        [HttpDelete("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var delete = await _facilityService.DeleteFacility(id);
                if (delete.Success)
                    return Ok(new { delete.Message });
                else
                {
                    return BadRequest(new { delete.Message });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi xóa cơ sở. Vui lòng thử lại sau." }); 
            }
        }

        [HttpGet("by-user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetFacilitiesByUserId(int userId)
        {
            try
            {
                var result = await _facilityService.GetFacilitiesByUserId(userId);

                if (result.Success)
                {
                    return Ok(result.Data ?? Enumerable.Empty<FacilityDto>());
                }
                return BadRequest(new { error = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi lấy danh sách cơ sở theo ID người dùng. Vui lòng thử lại sau." }); 
            }
        }

        [HttpGet("{facilityId}/category-field-names")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategoryFieldNamesForFacility(int facilityId)
        {
            try
            {
                var result = await _facilityService.GetCategoryFieldNamesByFacilityId(facilityId);

                if (result.Success)
                {
                    return Ok(result.Data ?? Enumerable.Empty<string>());
                }
                else
                {
                    if (result.Message.Contains("Không tìm thấy loại sân nào cho cơ sở"))
                    {
                        return NotFound(new { error = result.Message });
                    }
                    return BadRequest(new { error = result.Message });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn khi lấy tên loại sân theo cơ sở. Vui lòng thử lại sau." });
            }
        }
    }
}