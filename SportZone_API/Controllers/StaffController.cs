using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet("GetAll")]
        [RoleAuthorize("3")]
        public async Task<IActionResult> GetAllStaff()
        {
            var result = await _staffService.GetAllStaffAsync();
            if (result.Success)
            {
                if (result.Data != null && result.Data.Any())
                {
                    return Ok(new { success = true, message = result.Message, data = result.Data });
                }
                return NotFound(new { success = false, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpGet("by-facility/{facilityId}")]
        [RoleAuthorize("2")]
        [SwaggerOperation(Summary = "Lấy thông tin Staff của sân nào đó  : Field Owner")]
        public async Task<IActionResult> GetStaffByFacilityId(int facilityId)
        {
            var result = await _staffService.GetStaffByFacilityIdAsync(facilityId);
            if (result.Success)
            {
                if (result.Data != null && result.Data.Any())
                {
                    return Ok(new { success = true, message = result.Message, data = result.Data });
                }
                return NotFound(new { success = false, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpGet("{uId}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> GetStaffByUId(int uId)
        {
            var result = await _staffService.GetStaffByUIdAsync(uId);
            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message, data = result.Data });
            }
            return NotFound(new { success = false, message = result.Message });
        }

        [HttpPut("{uId}")]
        [RoleAuthorize("2")]
        [SwaggerOperation(Summary = "Update thông tin Staff  : Field Owner")]
        public async Task<IActionResult> UpdateStaff(int uId, [FromForm] UpdateStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
            }

            var result = await _staffService.UpdateStaffAsync(uId, dto);
            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpDelete("{uId}")]
        [RoleAuthorize("2")]
        [SwaggerOperation(Summary = "Xoá Staff  : Field Owner")]
        public async Task<IActionResult> DeleteStaff(int uId)
        {
            var result = await _staffService.DeleteStaffAsync(uId);
            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message });
            }
            return BadRequest(new { success = false, error = result.Message });
        }

        [HttpGet("field-owner/{fieldOwnerId}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> GetStaffByFieldOwnerId(int fieldOwnerId)
        {
            if (fieldOwnerId <= 0)
            {
                return BadRequest("Field Owner ID phải lớn hơn 0");
            }

            var result = await _staffService.GetStaffByFieldOwnerIdAsync(fieldOwnerId);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return NotFound(result);
        }        
    }
}