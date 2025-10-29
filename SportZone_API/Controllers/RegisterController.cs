using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using System.Threading.Tasks;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly IRegisterService _registerService;

        public RegisterController(IRegisterService registerService)
        {
            _registerService = registerService;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromForm] RegisterDto dto) 
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }

            var result = await _registerService.RegisterUserAsync(dto);
            if (result.Success)
                return Ok(new { message = result.Message });
            else
                return BadRequest(new { error = result.Message });
        }
    }
}