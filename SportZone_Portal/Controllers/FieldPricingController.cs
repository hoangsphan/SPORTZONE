using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FieldPricingController : ControllerBase
    {
        private readonly IFieldPricingService _fieldPricingService;

        public FieldPricingController(IFieldPricingService fieldPricingService)
        {
            _fieldPricingService = fieldPricingService;
        }

        // GET: api/FieldPricing
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FieldPricingDto>>> GetAllFieldPricings()
        {
            var pricings = await _fieldPricingService.GetAllFieldPricingsAsync();
            var result = pricings.Select(p => new {
                id = p.PricingId,
                fieldId = p.FieldId,
                startTime = p.StartTime,
                endTime = p.EndTime,
                price = p.Price
            });
            return Ok(new { success = true, data = result });
        }

        // GET: api/FieldPricing/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<FieldPricingDto>> GetFieldPricing(int id)
        {
            var pricing = await _fieldPricingService.GetFieldPricingByIdAsync(id);
            if (pricing == null)
            {
                return NotFound("Không tìm thấy cấu hình giá.");
            }
            var result = new {
                id = pricing.PricingId,
                fieldId = pricing.FieldId,
                startTime = pricing.StartTime,
                endTime = pricing.EndTime,
                price = pricing.Price
            };
            return Ok(new { success = true, data = result });
        }

        // GET: api/FieldPricing/byField/{fieldId}
        [HttpGet("byField/{fieldId}")]
        [AllowAnonymous]
        [SwaggerOperation(Summary = "Lấy giá của từng sân cho bảng giá  : Customer")]
        public async Task<ActionResult<IEnumerable<FieldPricingDto>>> GetFieldPricingsByField(int fieldId)
        {
            var pricings = await _fieldPricingService.GetFieldPricingsByFieldIdAsync(fieldId);
            var result = pricings.Select(p => new {
                id = p.PricingId,
                fieldId = p.FieldId,
                startTime = p.StartTime,
                endTime = p.EndTime,
                price = p.Price
            });
            return Ok(new { success = true, data = result });
        }

        // POST: api/FieldPricing
        [HttpPost]
        [RoleAuthorize("2")]
        [SwaggerOperation(Summary = "Tạo bảng giá cho sân  : Field Owner")]
        public async Task<ActionResult<FieldPricingDto>> CreateFieldPricing(FieldPricingCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newPricing = await _fieldPricingService.CreateFieldPricingAsync(createDto);

            return CreatedAtAction(nameof(GetFieldPricing), new { id = newPricing.FieldId }, newPricing);
        }

        // PUT: api/FieldPricing/{id}
        [HttpPut("{id}")]
        [RoleAuthorize("2")]
        [SwaggerOperation(Summary = "Sửa bảng giá cho sân  : Field Owner")]
        public async Task<IActionResult> UpdateFieldPricing(int id, FieldPricingUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedPricing = await _fieldPricingService.UpdateFieldPricingAsync(id, updateDto);
            if (updatedPricing == null)
            {
                return NotFound("Không tìm thấy cấu hình giá để cập nhật.");
            }
            return Ok(updatedPricing);
        }

        // DELETE: api/FieldPricing/{id}
        [HttpDelete("{id}")]
        [RoleAuthorize("2")]
        [SwaggerOperation(Summary = "Xoá bảng giá cho sân  : Field Owner")]
        public async Task<IActionResult> DeleteFieldPricing(int id)
        {
            var result = await _fieldPricingService.DeleteFieldPricingAsync(id);
            if (!result)
            {
                return NotFound("Không tìm thấy cấu hình giá để xóa.");
            }
            return NoContent();
        }
    }
}