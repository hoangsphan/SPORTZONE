using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]

    public class DiscountController : ControllerBase
    {
        private readonly IDiscountService _discountService;

        public DiscountController(IDiscountService discountService)
        {
            _discountService = discountService;
        }

        // GET: api/Discount
        [HttpGet]
        [RoleAuthorize("3")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _discountService.GetAllDiscounts();
            return Ok(result);
        }

        // GET: api/Discount/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _discountService.GetDiscountById(id);
            if (result == null)
                return NotFound(new { Message = "Không tìm thấy giảm giá." });

            return Ok(result);
        }

        // GET: api/Discount/facility/{facId}
        [HttpGet("facility/{facId}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> GetByFacilityId(int facId)
        {
            var result = await _discountService.GetDiscountsByFacilityId(facId);
            return Ok(result);
        }

        // GET: api/Discount/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveDiscounts()
        {
            var result = await _discountService.GetActiveDiscounts();
            return Ok(result);
        }

        // GET: api/Discount/active/facility/{facId}
        [HttpGet("active/facility/{facId}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> GetActiveDiscountsByFacility(int facId)
        {
            var result = await _discountService.GetActiveDiscountsByFacility(facId);
            return Ok(result);
        }

        // GET: api/Discount/search/{text}
        [HttpGet("search/{text}")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(string text)
        {
            var result = await _discountService.SearchDiscounts(text);
            return Ok(result);
        }

        // POST: api/Discount
        [HttpPost]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Create([FromBody] DiscountDto dto)
        {
            var create = await _discountService.CreateDiscount(dto);
            if (create.Success)
                return Ok(new { create.Message, create.Data });
            else
                return BadRequest(new { create.Message });
        }

        // PUT: api/Discount/{id}
        [HttpPut("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Update(int id, [FromBody] DiscountDto dto)
        {
            var update = await _discountService.UpdateDiscount(id, dto);
            if (update.Success)
                return Ok(new { update.Message, update.Data });
            else
                return BadRequest(new { update.Message });
        }

        // DELETE: api/Discount/{id}
        [HttpDelete("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Delete(int id)
        {
            var delete = await _discountService.DeleteDiscount(id);
            if (delete.Success)
                return Ok(new { delete.Message });
            else
                return BadRequest(new { delete.Message });
        }
    }
}