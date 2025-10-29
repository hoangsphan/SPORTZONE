using System.Threading.Tasks;
using System.Collections.Generic;
using SportZone_API.Models;
using SportZone_API.DTOs;

namespace SportZone_API.Services.Interfaces
{
    public interface IAuthService
    {
        // Business logic methods
        Task<(string token, LoginResponseDTO user, FacilityInfoLoginDTO? facilityInfo)> LoginAsync(LoginDTO loginDto);
        //Task<(string token, User user)> LoginAsync(LoginDTO loginDto);
        Task<(string token, User user)> GoogleLoginAsync(GoogleLoginDTO googleLoginDto);
        Task<LogoutResponseDTO> LogoutAsync(LogoutDTO logoutDto);

        // Password helper methods
        string HashPassword(string plainPassword);
        bool VerifyPassword(User user, string plainPassword, string hashedPassword);

        // JWT token methods  
        string GenerateJwtToken(User user);
        Task<bool> InvalidateTokenAsync(string token);
        Task<bool> ValidateTokenAsync(string token);

        // Session management
        Task<bool> InvalidateAllUserTokensAsync(int userId);
    }
}