using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForgotPasswordController : ControllerBase
    {
        private readonly IForgotPasswordService _forgotPasswordService;

        public ForgotPasswordController(IForgotPasswordService forgotPasswordService)
        {
            _forgotPasswordService = forgotPasswordService;
        }

        [HttpPost("send-code")]
        public async Task<IActionResult> SendVerificationCode([FromBody] ForgotPasswordDto dto)
        {
            var result = await _forgotPasswordService.SendCodeAsync(dto);
            if (result.Success)
                return Ok(new { message = result.Message });
            return BadRequest(new { error = result.Message });
        }

        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCodeAndResetPassword([FromBody] VerifyCodeDto dto)
        {
            var result = await _forgotPasswordService.ResetPasswordAsync(dto);
            if (result.Success)
                return Ok(new { message = result.Message });
            return BadRequest(new { error = result.Message });
        }
    }
}
