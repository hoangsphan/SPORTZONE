//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using SportZone_API.Attributes;
//using SportZone_API.DTOs;
//using SportZone_API.Services.Interfaces;
//using System.Collections.Generic;
//using System.Threading.Tasks;

//namespace SportZone_API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    [Authorize]
//    public class FieldBookingScheduleController : ControllerBase
//    {
//        private readonly IFieldBookingScheduleService _scheduleService;

//        public FieldBookingScheduleController(IFieldBookingScheduleService scheduleService)
//        {
//            _scheduleService = scheduleService;
//        }

//        // GET: api/FieldBookingSchedule
//        [HttpGet]
//        [AllowAnonymous]
//        public async Task<ActionResult<IEnumerable<FieldBookingScheduleDto>>> GetFieldBookingSchedules()
//        {
//            var schedules = await _scheduleService.GetAllFieldBookingSchedulesAsync();
//            return Ok(schedules);
//        }

//        // GET: api/FieldBookingSchedule/5
//        [HttpGet("{id}")]
//        [AllowAnonymous]
//        public async Task<ActionResult<FieldBookingScheduleDto>> GetFieldBookingSchedule(int id)
//        {
//            var schedule = await _scheduleService.GetFieldBookingScheduleByIdAsync(id);
//            if (schedule == null)
//            {
//                return NotFound("Không tìm thấy lịch đặt sân.");
//            }
//            return Ok(schedule);
//        }

//        // POST: api/FieldBookingSchedule/generate
//        [HttpPost("generate")]
//        [RoleAuthorize("2")]
//        public async Task<IActionResult> GenerateFieldBookingSchedules([FromBody] FieldBookingScheduleGenerateDto generateDto)
//        {
//            if (!ModelState.IsValid)
//            {
//                return BadRequest(ModelState);
//            }

//            var response = await _scheduleService.GenerateFieldBookingSchedulesAsync(generateDto);

//            if (!response.IsSuccess)
//            {
//                return BadRequest(new { Message = response.Message });
//            }
//            else
//            {
//                return Ok(new { Message = response.Message });
//            }
//        }

//        // PUT: api/FieldBookingSchedule/5
//        [HttpPut("{id}")]
//        [RoleAuthorize("2")]
//        public async Task<IActionResult> UpdateFieldBookingSchedule(int id, FieldBookingScheduleUpdateDto updateDto)
//        {
//            var updatedSchedule = await _scheduleService.UpdateFieldBookingScheduleAsync(id, updateDto);
//            if (updatedSchedule == null)
//            {
//                return NotFound("Không tìm thấy lịch đặt sân để cập nhật.");
//            }
//            return Ok(updatedSchedule);
//        }

//        // DELETE: api/FieldBookingSchedule/5
//        [HttpDelete("{id}")]
//        [RoleAuthorize("2")]
//        public async Task<IActionResult> DeleteFieldBookingSchedule(int id)
//        {
//            var response = await _scheduleService.DeleteFieldBookingScheduleAsync(id);
//            if (!response.IsSuccess)
//            {
//                if (response.Message.Contains("Không tìm thấy"))
//                {
//                    return NotFound(new { Message = response.Message });
//                }
//                else if (response.Message.Contains("đã có booking"))
//                {
//                    return Conflict(new { Message = response.Message });
//                }
//                else
//                {
//                    return BadRequest(new { Message = response.Message });
//                }
//            }
//            else
//            {
//                return Ok(new { Message = response.Message });
//            }
//        }

//        // GET: api/FieldBookingSchedule/facility/{facilityId}/date/{date}
//        [HttpGet("facility/{facilityId}/date/{date}")]
//        public async Task<ActionResult<ServiceResponse<FieldBookingScheduleByDateDto>>> GetSchedulesByFacilityAndDate(int facilityId, DateOnly date)
//        {
//            if (facilityId <= 0)
//            {
//                return BadRequest("Facility ID phải lớn hơn 0");
//            }

//            var result = await _scheduleService.GetSchedulesByFacilityAndDateAsync(facilityId, date);

//            if (result.Success)
//            {
//                return Ok(result);
//            }

//            return NotFound(result);
//        }
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FieldBookingScheduleController : ControllerBase
    {
        private readonly IFieldBookingScheduleService _scheduleService;

        public FieldBookingScheduleController(IFieldBookingScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        // GET: api/FieldBookingSchedule
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FieldBookingScheduleDto>>> GetFieldBookingSchedules()
        {
            var schedules = await _scheduleService.GetAllFieldBookingSchedulesAsync();
            return Ok(schedules);
        }

        // GET: api/FieldBookingSchedule/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<FieldBookingScheduleDto>> GetFieldBookingSchedule(int id)
        {
            var schedule = await _scheduleService.GetFieldBookingScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound("Không tìm thấy lịch đặt sân.");
            }
            return Ok(schedule);
        }

        // POST: api/FieldBookingSchedule/generate
        [HttpPost("generate")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> GenerateFieldBookingSchedules([FromBody] FieldBookingScheduleGenerateDto generateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _scheduleService.GenerateFieldBookingSchedulesAsync(generateDto);

            if (!response.IsSuccess)
            {
                return BadRequest(new { Message = response.Message });
            }
            else
            {
                return Ok(new { Message = response.Message });
            }
        }

        // PUT: api/FieldBookingSchedule/update-generate
        // Sử dụng một endpoint riêng để cập nhật nhiều lịch
        [HttpPut("update-generate")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> UpdateGeneratedSchedules([FromBody] FieldBookingScheduleUpdateGenerateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _scheduleService.UpdateGeneratedFieldBookingSchedulesAsync(updateDto);

            if (!response.IsSuccess)
            {
                // Trả về BadRequest hoặc Conflict tùy thuộc vào lỗi cụ thể
                if (response.Message.Contains("đã có booking"))
                {
                    return Conflict(new { Message = response.Message });
                }
                return BadRequest(new { Message = response.Message });
            }
            return Ok(new { Message = response.Message });
        }

        // DELETE: api/FieldBookingSchedule/delete-generate
        // Sử dụng một endpoint riêng để xóa nhiều lịch
        [HttpDelete("delete-generate")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> DeleteGeneratedSchedules([FromBody] FieldBookingScheduleDeleteGenerateDto deleteDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _scheduleService.DeleteGeneratedFieldBookingSchedulesAsync(deleteDto);

            if (!response.IsSuccess)
            {
                if (response.Message.Contains("Không tìm thấy"))
                {
                    return NotFound(new { Message = response.Message });
                }
                if (response.Message.Contains("đã có booking"))
                {
                    return Conflict(new { Message = response.Message });
                }
                return BadRequest(new { Message = response.Message });
            }
            return Ok(new { Message = response.Message });
        }


        // GET: api/FieldBookingSchedule/facility/{facilityId}/date/{date}
        [HttpGet("facility/{facilityId}/date/{date}")]
        public async Task<ActionResult<ServiceResponse<FieldBookingScheduleByDateDto>>> GetSchedulesByFacilityAndDate(int facilityId, DateOnly date)
        {
            if (facilityId <= 0)
            {
                return BadRequest("Facility ID phải lớn hơn 0");
            }

            var result = await _scheduleService.GetSchedulesByFacilityAndDateAsync(facilityId, date);

            if (result.Success)
            {
                return Ok(result);
            }

            return NotFound(result);
        }
    }
}