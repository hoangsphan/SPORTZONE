using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FieldController : ControllerBase
    {
        private readonly IFieldService _fieldService;
        public FieldController(IFieldService fieldService)
        {
            _fieldService = fieldService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllFields()
        {
            try
            {
                var fields = await _fieldService.GetAllFieldsAsync();
                return Ok(new
                {
                    success = true, 
                    message = "Lấy danh sách sân thành công",
                    data = fields,
                    count = fields.Count()
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

        [HttpGet("GetAllFields/Search/")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllFields([FromQuery] string? search = null)
        {
            try
            {
                IEnumerable<FieldResponseDTO> fields;
                if (!string.IsNullOrWhiteSpace(search))
                {
                    fields = await _fieldService.GetAllFieldsAsync(search); 
                }
                else
                {
                    fields = await _fieldService.GetAllFieldsAsync();
                }
                return Ok(new
                {   
                    success = true,
                    message = string.IsNullOrWhiteSpace(search) ? "Lấy danh sách sân thành công" : $"Tìm kiếm sân với từ khóa '{search}' thành công",
                    data = fields,
                    conut = fields.Count(),
                    searchTerm = search
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

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFieldByID(int id)
        {
            try
            {
                var field = await _fieldService.GetFieldByIdAsync(id);
                if (field == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy sân"
                    });
                }
                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin sân thành công",
                    data = field
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

        [HttpGet("facility/{facId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFieldByFacility(int facId)
        {
            try
            {
                var fields = await _fieldService.GetFieldsByFacilityAsync(facId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách sân theo cơ sở thành công",
                    data = fields,
                    count = fields.Count(),
                    facilityId = facId
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

        [HttpGet("category/{categoryId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFieldsByCategory(int categoryId)
        {
            try
            {
                var fields = await _fieldService.GetFieldsByCategoryAsync(categoryId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách sân theo loại thành công",
                    data = fields,
                    count = fields.Count(),
                    categoryId = categoryId
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
        [AllowAnonymous]
        public async Task<IActionResult> GetFieldsByUserId(int userId)
        {
            try
            {
                var fields = await _fieldService.GetFieldsByUserIdAsync(userId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách sân theo user thành công",
                    data = fields,
                    count = fields.Count(),
                    userId = userId
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

        [HttpGet("{fieldId}/schedule")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFieldSchedule(int fieldId)
        {
            try
            {
                var schedules = await _fieldService.GetFieldScheduleByFieldIdAsync(fieldId);
                return Ok(new
                {
                    success = true,
                    message = "Lấy lịch sân thành công",
                    data = schedules,
                    count = schedules.Count(),
                    fieldId = fieldId
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

        [HttpPost("Create-Field")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> CreateField([FromBody] FieldCreateDTO fieldDto)
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
                var field = await _fieldService.CreateFieldAsync(fieldDto);
                return CreatedAtAction(nameof(GetFieldByID), new { id = field.FieldId }, new
                {
                    success = true,
                    message = "Tạo sân mới thành công",
                    data = new
                    {
                        field.FieldId,
                        field.FieldName,
                        field.FacId,
                        field.CategoryId,
                        field.Description,
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
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        [HttpPut("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> UpdateField(int id, [FromBody] FieldUpdateDTO fieldDto)
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
                var result = await _fieldService.UpdateFieldAsync(id, fieldDto);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = true,
                        message = "Không tìm thấy sân để cập nhật"
                    });
                }
                return Ok(new
                {
                    success = true,
                    message = "Cập nhật sân thành công",
                    fieldId = id
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

        [HttpDelete("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> DeleteField(int id)
        {
            try
            {
                var result = await _fieldService.DeleteFieldAsync(id);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy sân để xóa"
                    });
                }
                return Ok(new
                {
                    success = true,
                    message = "Xóa sân thành công",
                    fieldId = id
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
