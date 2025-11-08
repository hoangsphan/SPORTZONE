using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Pages.Account
{
    public class RegisterModel : PageModel
    {
        private static readonly IReadOnlyList<SelectListItem> DefaultRoleOptions = new List<SelectListItem>
        {
            new("Khách hàng", "Customer"),
            new("Chủ sân", "Field_Owner"),
            new("Nhân viên", "Staff")
        };

        private readonly IRegisterService _registerService;
        private readonly ILogger<RegisterModel> _logger;

        public RegisterModel(IRegisterService registerService, ILogger<RegisterModel> logger)
        {
            _registerService = registerService;
            _logger = logger;
        }

        [BindProperty]
        public RegisterInputModel Input { get; set; } = new();

        public string? SuccessMessage { get; private set; }

        public string? ErrorMessage { get; private set; }

        public IReadOnlyList<SelectListItem> RoleOptions => DefaultRoleOptions;

        public void OnGet()
        {
            Input ??= new RegisterInputModel();
            if (string.IsNullOrWhiteSpace(Input.RoleName))
            {
                Input.RoleName = RoleOptions[0].Value;
            }
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var request = Input.ToRegisterDto();
                var response = await _registerService.RegisterUserAsync(request);

                if (!response.Success)
                {
                    ErrorMessage = response.Message ?? "Không thể đăng ký tài khoản.";
                    SuccessMessage = null;
                    return Page();
                }

                SuccessMessage = response.Message ?? "Đăng ký tài khoản thành công.";
                ErrorMessage = null;

                var selectedRole = Input.RoleName;
                ModelState.Clear();
                Input = new RegisterInputModel { RoleName = selectedRole };
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Không thể đăng ký tài khoản cho email {Email}", Input.Email);
                ErrorMessage = "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.";
                SuccessMessage = null;
            }

            return Page();
        }

        public class RegisterInputModel
        {
            [Required(ErrorMessage = "Vui lòng chọn vai trò.")]
            public string RoleName { get; set; } = string.Empty;

            [Required(ErrorMessage = "Họ và tên không được để trống.")]
            [StringLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự.")]
            public string Name { get; set; } = string.Empty;

            [Required(ErrorMessage = "Số điện thoại không được để trống.")]
            [StringLength(20, MinimumLength = 10, ErrorMessage = "Số điện thoại phải từ 10 đến 20 ký tự.")]
            public string Phone { get; set; } = string.Empty;

            [Required(ErrorMessage = "Email không được để trống.")]
            [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
            [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "Mật khẩu không được để trống.")]
            [StringLength(255, MinimumLength = 10, ErrorMessage = "Mật khẩu phải dài ít nhất 10 ký tự.")]
            [DataType(DataType.Password)]
            public string Password { get; set; } = string.Empty;

            [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu.")]
            [Compare(nameof(Password), ErrorMessage = "Mật khẩu và xác nhận không khớp.")]
            [DataType(DataType.Password)]
            public string ConfirmPassword { get; set; } = string.Empty;

            [Range(1, int.MaxValue, ErrorMessage = "Mã cơ sở phải là số nguyên dương.")]
            public int? FacId { get; set; }

            public DateOnly? Dob { get; set; }

            public DateOnly? StartTime { get; set; }

            public DateOnly? EndTime { get; set; }

            public IFormFile? ImageFile { get; set; }

            public RegisterDto ToRegisterDto()
            {
                return new RegisterDto
                {
                    RoleName = RoleName?.Trim() ?? string.Empty,
                    Name = Name?.Trim() ?? string.Empty,
                    Phone = Phone?.Trim() ?? string.Empty,
                    Email = Email?.Trim() ?? string.Empty,
                    Password = Password,
                    ConfirmPassword = ConfirmPassword,
                    FacId = FacId,
                    Dob = Dob,
                    StartTime = StartTime,
                    EndTime = EndTime,
                    ImageFile = ImageFile
                };
            }
        }
    }
}
