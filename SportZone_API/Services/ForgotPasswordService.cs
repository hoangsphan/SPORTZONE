using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Net;
using System.Net.Mail;

namespace SportZone_API.Services
{
    public class ForgotPasswordService : IForgotPasswordService
    {
        private readonly IForgotPasswordRepository _repository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly SendEmail _emailSettings;
        private readonly IMemoryCache _cache;

        public ForgotPasswordService(
            IForgotPasswordRepository repository,
            IPasswordHasher<User> passwordHasher,
            IOptions<SendEmail> emailOptions,
            IMemoryCache cache)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _emailSettings = emailOptions.Value;
            _cache = cache;
        }

        public async Task<ServiceResponse<string>> SendCodeAsync(ForgotPasswordDto dto)
        {
            var user = await _repository.GetUserByEmailAsync(dto.Email);
            if (user == null)
                return Fail("Email không tồn tại."); 

            var code = new Random().Next(100000, 999999).ToString();
            var cacheKey = $"ResetCode:{code}";
            _cache.Set(cacheKey, dto.Email, TimeSpan.FromMinutes(10));

            var mail = new MailMessage
            {
                From = new MailAddress(_emailSettings.Email, _emailSettings.DisplayName),
                Subject = "Mã xác nhận quên mật khẩu", 
                Body = $"Mã xác nhận của bạn là: {code}" 
            };
            mail.To.Add(dto.Email);

            using (var smtp = new SmtpClient(_emailSettings.Host, _emailSettings.Port))
            {
                smtp.Credentials = new NetworkCredential(_emailSettings.Email, _emailSettings.Password);
                smtp.EnableSsl = true;
                await smtp.SendMailAsync(mail);
            }

            return new ServiceResponse<string> { Success = true, Message = "Mã xác nhận đã được gửi đến email." }; 
        }

        public async Task<ServiceResponse<string>> ResetPasswordAsync(VerifyCodeDto dto)
        {
            var cacheKey = $"ResetCode:{dto.Code}";

            if (!_cache.TryGetValue(cacheKey, out string email))
                return Fail("Mã xác nhận không tìm thấy hoặc đã hết hạn."); 

            if (!RegisterService.IsValidPassword(dto.NewPassword))
                return Fail("Mật khẩu phải có ít nhất 10 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."); 

            if (dto.NewPassword != dto.ConfirmPassword)
                return Fail("Mật khẩu xác nhận không khớp."); 

            var user = await _repository.GetUserByEmailAsync(email);
            if (user == null)
                return Fail("Không tìm thấy người dùng."); 

            user.UPassword = _passwordHasher.HashPassword(user, dto.NewPassword);
            await _repository.SaveUserAsync();
            _cache.Remove(cacheKey);

            return new ServiceResponse<string> { Success = true, Message = "Mật khẩu đã được thay đổi thành công." }; 
        }

        private static ServiceResponse<string> Fail(string msg) => new() { Success = false, Message = msg };
    }
}