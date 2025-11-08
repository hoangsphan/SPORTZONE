using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.Attributes;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RegulationSystemController : ControllerBase
    {
        private readonly IRegulationSystemService _regulationSystemService;

        public RegulationSystemController(IRegulationSystemService regulationSystemService)
        {
            _regulationSystemService = regulationSystemService;
        }

        // GET: api/RegulationSystem
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var result = await _regulationSystemService.GetAllRegulationSystems();
            return Ok(result);
        }

        // GET: api/RegulationSystem/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _regulationSystemService.GetRegulationSystemById(id);
            if (result == null)
                return NotFound(new { Message = "Không tìm thấy quy định hệ thống." });

            return Ok(result);
        }

        // GET: api/RegulationSystem/search/{text}
        [HttpGet("search/{text}")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(string text)
        {
            var result = await _regulationSystemService.SearchRegulationSystems(text);
            return Ok(result);
        }

        // POST: api/RegulationSystem
        [HttpPost]
        [RoleAuthorize("3")]
        [SwaggerOperation(Summary = "Tạo regulation system : Admin")]
        public async Task<IActionResult> Create([FromBody] RegulationSystemDto dto)
        {
            var create = await _regulationSystemService.CreateRegulationSystem(dto);
            if (create.Success)
                return Ok(new { create.Message, create.Data });
            else
                return BadRequest(new { create.Message });
        }

        // PUT: api/RegulationSystem/{id}
        [HttpPut("{id}")]
        [RoleAuthorize("3")]
        [SwaggerOperation(Summary = "Sửa regulation system : Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] RegulationSystemDto dto)
        {
            var update = await _regulationSystemService.UpdateRegulationSystem(id, dto);
            if (update.Success)
                return Ok(new { update.Message, update.Data });
            else
                return BadRequest(new { update.Message });
        }

        // DELETE: api/RegulationSystem/{id}
        [HttpDelete("{id}")]
        [RoleAuthorize("3")]
        [SwaggerOperation(Summary = "Xoá regulation system : Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var delete = await _regulationSystemService.DeleteRegulationSystem(id);
            if (delete.Success)
                return Ok(new { delete.Message });
            else
                return BadRequest(new { delete.Message });
        }
    }
}