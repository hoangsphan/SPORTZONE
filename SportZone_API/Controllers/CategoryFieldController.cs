using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs; 
using SportZone_API.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryFieldController : ControllerBase
    {
        private readonly ICategoryFieldService _categoryFieldService;

        public CategoryFieldController(ICategoryFieldService categoryFieldService)
        {
            _categoryFieldService = categoryFieldService;
        }

        [HttpGet] // GET: api/CategoryField
        [SwaggerOperation(Summary = "Lấy tất cả category_field để đẩy lên homepage phần filter : Customer")]
        public async Task<IActionResult> GetAllCategoryFields()
        {
            var result = await _categoryFieldService.GetAllCategoryFields();
            if (result.Success)
            {
                return Ok(result.Data ?? Enumerable.Empty<CategoryFieldDto>());
            }
            return BadRequest(new { error = result.Message });
        }

        [HttpGet("{id}")] // GET: api/CategoryField/{id}
        public async Task<IActionResult> GetCategoryFieldById(int id)
        {
            var result = await _categoryFieldService.GetCategoryFieldById(id);
            if (result.Success)
            {
                return Ok(result.Data);
            }
            else
            {
                if (result.Message.Contains("không tìm thấy"))
                {
                    return NotFound(new { error = result.Message });
                }
                return BadRequest(new { error = result.Message });
            }
        }

        [HttpGet("{id}/name")]
        public async Task<IActionResult> GetCategoryFieldNameById(int id)
        {
            var result = await _categoryFieldService.GetCategoryFieldNameById(id);
            if (result.Success)
            {
                return Ok(new { CategoryFieldName = result.Data });
            }
            else
            {
                if (result.Message.Contains("không tìm thấy"))
                {
                    return NotFound(new { error = result.Message });
                }
                return BadRequest(new { error = result.Message });
            }
        }
    }
}