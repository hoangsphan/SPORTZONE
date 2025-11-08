using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Pages.Account
{
    public class ForgotPasswordModel : PageModel
    {
        private readonly IForgotPasswordService _forgotPasswordService;
        private readonly ILogger<ForgotPasswordModel> _logger;

        public ForgotPasswordModel(IForgotPasswordService forgotPasswordService, ILogger<ForgotPasswordModel> logger)
        {
            _forgotPasswordService = forgotPasswordService;
            _logger = logger;
        }

        [BindProperty]
        public SendCodeInputModel SendCode { get; set; } = new();

        [BindProperty]
        public ResetPasswordInputModel Reset { get; set; } = new();

        public string? SuccessMessage { get; private set; }

        public string? ErrorMessage { get; private set; }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostSendCodeAsync()
        {
            ModelState.Remove("Reset.Code");
            ModelState.Remove("Reset.NewPassword");
            ModelState.Remove("Reset.ConfirmPassword");

            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var response = await _forgotPasswordService.SendCodeAsync(new ForgotPasswordDto
                {
                    Email = SendCode.Email ?? string.Empty
                });

                if (!response.Success)
                {
                    ErrorMessage = response.Message ?? "Không thể gửi mã xác nhận.";
                    SuccessMessage = null;
                }
                else
                {
                    SuccessMessage = response.Message ?? "Mã xác nhận đã được gửi.";
                    ErrorMessage = null;
                }
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Không thể gửi mã xác nhận cho email {Email}", SendCode.Email);
                ErrorMessage = "Không thể gửi mã xác nhận. Vui lòng thử lại sau.";
                SuccessMessage = null;
            }

            return Page();
        }

        public async Task<IActionResult> OnPostResetAsync()
        {
            ModelState.Remove("SendCode.Email");

            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var response = await _forgotPasswordService.ResetPasswordAsync(new VerifyCodeDto
                {
                    Code = Reset.Code ?? string.Empty,
                    NewPassword = Reset.NewPassword ?? string.Empty,
                    ConfirmPassword = Reset.ConfirmPassword ?? string.Empty
                });

                if (!response.Success)
                {
                    ErrorMessage = response.Message ?? "Không thể đặt lại mật khẩu.";
                    SuccessMessage = null;
                }
                else
                {
                    SuccessMessage = response.Message ?? "Đặt lại mật khẩu thành công.";
                    ErrorMessage = null;
                    Reset = new ResetPasswordInputModel();
                }
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Không thể đặt lại mật khẩu bằng mã {Code}", Reset.Code);
                ErrorMessage = "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.";
                SuccessMessage = null;
            }

            return Page();
        }

        public class SendCodeInputModel
        {
            [Required(ErrorMessage = "Email không được để trống.")]
            [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
            public string? Email { get; set; }
        }

        public class ResetPasswordInputModel
        {
            [Required(ErrorMessage = "Vui lòng nhập mã xác nhận.")]
            [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã xác nhận gồm 6 chữ số.")]
            public string? Code { get; set; }

            [Required(ErrorMessage = "Mật khẩu mới không được để trống.")]
            [StringLength(255, MinimumLength = 10, ErrorMessage = "Mật khẩu phải dài ít nhất 10 ký tự.")]
            [DataType(DataType.Password)]
            public string? NewPassword { get; set; }

            [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu.")]
            [Compare(nameof(NewPassword), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
            [DataType(DataType.Password)]
            public string? ConfirmPassword { get; set; }
        }
    }
}
