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
    public class RegulationFacilityController : ControllerBase
    {
        private readonly IRegulationFacilityService _regulationFacilityService;

        public RegulationFacilityController(IRegulationFacilityService regulationFacilityService)
        {
            _regulationFacilityService = regulationFacilityService;
        }

        // GET: api/RegulationFacility
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var result = await _regulationFacilityService.GetAllRegulationFacilities();
            return Ok(result);
        }

        // GET: api/RegulationFacility/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _regulationFacilityService.GetRegulationFacilityById(id);
            if (result == null)
                return NotFound(new { Message = "Không tìm thấy quy định cơ sở." });

            return Ok(result);
        }

        // GET: api/RegulationFacility/facility/{facId}
        [HttpGet("facility/{facId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByFacilityId(int facId)
        {
            var result = await _regulationFacilityService.GetRegulationFacilitiesByFacilityId(facId);
            return Ok(result);
        }

        // GET: api/RegulationFacility/search/{text}
        [HttpGet("search/{text}")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(string text)
        {
            var result = await _regulationFacilityService.SearchRegulationFacilities(text);
            return Ok(result);
        }

        // POST: api/RegulationFacility
        [HttpPost]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Create([FromBody] RegulationFacilityDto dto)
        {
            var create = await _regulationFacilityService.CreateRegulationFacility(dto);
            if (create.Success)
                return Ok(new { create.Message, create.Data });
            else
                return BadRequest(new { create.Message });
        }

        // PUT: api/RegulationFacility/{id}
        [HttpPut("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Update(int id, [FromBody] RegulationFacilityDto dto)
        {
            var update = await _regulationFacilityService.UpdateRegulationFacility(id, dto);
            if (update.Success)
                return Ok(new { update.Message, update.Data });
            else
                return BadRequest(new { update.Message });
        }

        // DELETE: api/RegulationFacility/{id}
        [HttpDelete("{id}")]
        [RoleAuthorize("2")]
        public async Task<IActionResult> Delete(int id)
        {
            var delete = await _regulationFacilityService.DeleteRegulationFacility(id);
            if (delete.Success)
                return Ok(new { delete.Message });
            else
                return BadRequest(new { delete.Message });
        }
    }
}