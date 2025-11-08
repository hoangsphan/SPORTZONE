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
    public class LoginModel : PageModel
    {
        private readonly IAuthService _authService;
        private readonly ILogger<LoginModel> _logger;

        public LoginModel(IAuthService authService, ILogger<LoginModel> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [BindProperty]
        public InputModel Input { get; set; } = new();

        public LoginResult? Result { get; private set; }

        public string? ErrorMessage { get; private set; }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var (token, user, facilityInfo) = await _authService.LoginAsync(new LoginDTO
                {
                    UEmail = Input.Email!,
                    UPassword = Input.Password!
                });

                Result = new LoginResult(token, user, facilityInfo);
                ErrorMessage = null;
            }
            catch (Exception exception)
            {
                var displayMessage = ExtractUserMessage(exception);
                ErrorMessage = string.IsNullOrWhiteSpace(displayMessage)
                    ? "Không thể đăng nhập vào lúc này. Vui lòng thử lại sau."
                    : displayMessage;

                _logger.LogWarning(exception, "Không thể đăng nhập cho tài khoản {Email}", Input.Email);
            }

            return Page();
        }

        private static string ExtractUserMessage(Exception exception)
        {
            var innermost = exception;
            while (innermost.InnerException is not null)
            {
                innermost = innermost.InnerException;
            }

            var message = innermost.Message;
            if (string.IsNullOrWhiteSpace(message))
            {
                message = exception.Message;
            }

            if (string.IsNullOrWhiteSpace(message))
            {
                return string.Empty;
            }

            const string Prefix = "Lỗi khi đăng nhập:";
            message = message.Trim();
            if (message.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
            {
                message = message[Prefix.Length..].Trim();
            }

            return message;
        }

        public sealed record LoginResult(string Token, LoginResponseDTO User, FacilityInfoLoginDTO? FacilityInfo);

        public class InputModel
        {
            [Required(ErrorMessage = "Email không được bỏ trống.")]
            [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
            public string? Email { get; set; }

            [Required(ErrorMessage = "Mật khẩu không được bỏ trống.")]
            [DataType(DataType.Password)]
            public string? Password { get; set; }
        }
    }
}
