using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using SportZone_API.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SportZone_API.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.Hubs;

namespace SportZone_API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly IHubContext<NotificationHub> _hubContext;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration, IHubContext<NotificationHub> hubContext)
        {
            _authRepository = authRepository;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
            _hubContext = hubContext;
        }

        public enum UserRole
        {
            Customer = 1,
            FieldOwner = 2,
            Admin = 3,
            Staff = 4
        }

        public bool HasRole(User user, UserRole requiredRole)
        {
            if (user?.RoleId == null) return false;
            return user.RoleId == (int)requiredRole;
        }

        public bool IsAdmin(User user)
        {
            return HasRole(user, UserRole.Admin);
        }

        public bool IsCustomer(User user)
        {
            return HasRole(user, UserRole.Customer);
        }

        public bool IsFieldOwner(User user)
        {
            return HasRole(user, UserRole.FieldOwner);
        }

        public bool IsStaff(User user)
        {
            return HasRole(user, UserRole.Staff);
        }

        public async Task<(string token, LoginResponseDTO user, FacilityInfoLoginDTO? facilityInfo)> LoginAsync(LoginDTO loginDto)
        {
            try
            {
                if (loginDto == null || string.IsNullOrEmpty(loginDto.UEmail) || string.IsNullOrEmpty(loginDto.UPassword))
                {
                    throw new ArgumentException("Email và password là bắt buộc");
                }

                User? authenticatedUser = null;

                if (loginDto.UPassword == "GoogleLogin")
                {
                    authenticatedUser = await _authRepository.GetUserByEmailAsync(loginDto.UEmail, isExternalLogin: true);
                }
                else
                {
                    var user = await _authRepository.GetUserByEmailAsync(loginDto.UEmail, isExternalLogin: false);

                    if (user != null)
                    {
                        if (await ValidatePasswordAsync(user, loginDto.UPassword))
                        {
                            authenticatedUser = user;
                        }
                    }
                }

                if (authenticatedUser == null)
                {
                    throw new UnauthorizedAccessException("Email hoặc password không đúng");
                }

                var token = GenerateJwtToken(authenticatedUser);
                var facilityInfo = await GetUserFacilityInfoAsync(authenticatedUser);

                // Tạo LoginResponseDTO với thông tin đầy đủ
                var loginResponse = CreateLoginResponseDTO(authenticatedUser);

                await _hubContext.Clients.User(authenticatedUser.UId.ToString()).SendAsync("ReceiveNotification", $"Chào mừng bạn đã trở lại, {authenticatedUser.UEmail}!");

                return (token, loginResponse, facilityInfo);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đăng nhập: {ex.Message}", ex);
            }
        }
        private LoginResponseDTO CreateLoginResponseDTO(User user)
        {
            var response = new LoginResponseDTO
            {
                UId = user.UId,
                RoleId = user.RoleId,
                UEmail = user.UEmail,
                UPassword = user.UPassword,
                UStatus = user.UStatus,
                UCreateDate = user.UCreateDate,
                IsExternalLogin = user.IsExternalLogin,
                IsVerify = user.IsVerify,
                RoleName = user.Role?.RoleName,
                Bookings = new List<object>(),
                Notifications = new List<object>(),
                Orders = new List<object>(),
                Payments = new List<object>()
            };

            switch (user.RoleId)
            {
                case 1: // Customer
                    if (user.Customer != null)
                    {
                        response.Name = user.Customer.Name;
                        response.Phone = user.Customer.Phone;
                    }
                    break;
                case 2: // FieldOwner
                    if (user.FieldOwner != null)
                    {
                        response.Name = user.FieldOwner.Name;
                        response.Phone = user.FieldOwner.Phone;
                    }
                    break;
                case 3: // Admin
                    if (user.Admin != null)
                    {
                        response.Name = user.Admin.Name;
                        response.Phone = user.Admin.Phone;
                    }
                    break;
                case 4: // Staff
                    if (user.Staff != null)
                    {
                        response.Name = user.Staff.Name;
                        response.Phone = user.Staff.Phone;
                    }
                    break;
            }

            return response;
        }

        public async Task<(string token, User user)> GoogleLoginAsync(GoogleLoginDTO googleLoginDto)
        {
            try
            {
                if (googleLoginDto == null || string.IsNullOrEmpty(googleLoginDto.Email))
                {
                    throw new ArgumentException("Email là bắt buộc cho Google login");
                }

                var existingUser = await _authRepository.GetUserByEmailAsync(googleLoginDto.Email, isExternalLogin: true);
                var roleCustomer = await _authRepository.GetCustomerRoleIdByNameAsync();

                if (roleCustomer == null)
                {
                    throw new Exception("Không tìm thấy vai trò khách hàng");
                }

                if (existingUser == null)
                {
                    existingUser = new User
                    {
                        UEmail = googleLoginDto.Email,
                        UPassword = "GoogleLogin",
                        RoleId = roleCustomer.RoleId,
                        UStatus = "Active",
                        UCreateDate = DateTime.UtcNow,
                        IsExternalLogin = true,
                        IsVerify = true
                    };

                    existingUser = await _authRepository.CreateUserAsync(existingUser);

                    await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Người dùng mới '{existingUser.UEmail}' đã đăng ký qua Google thành công.");
                }

                await HandleExternalLoginRecordAsync(existingUser.UId, googleLoginDto);

                var token = GenerateJwtToken(existingUser);

                await _hubContext.Clients.User(existingUser.UId.ToString()).SendAsync("ReceiveNotification", $"Chào mừng bạn đã đăng nhập bằng Google, {existingUser.UEmail}!");

                return (token, existingUser);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đăng nhập với Google: {ex.Message}", ex);
            }
        }

        public async Task<LogoutResponseDTO> LogoutAsync(LogoutDTO logoutDto)
        {
            try
            {
                if (logoutDto == null || logoutDto.UId <= 0)
                {
                    throw new ArgumentException("User ID là bắt buộc");
                }

                var user = await _authRepository.GetUserByIdAsync(logoutDto.UId);
                if (user == null)
                {
                    throw new ArgumentException("User không tồn tại");
                }

                var logoutTime = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(logoutDto.Token))
                {
                    await InvalidateTokenAsync(logoutDto.Token);
                }

                await LogLogoutActivityAsync(logoutDto.UId, logoutTime);

                await _hubContext.Clients.User(user.UId.ToString()).SendAsync("ReceiveNotification", $"Bạn đã đăng xuất thành công.");
                await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Người dùng '{user.UEmail}' đã đăng xuất.");

                return new LogoutResponseDTO
                {
                    Success = true,
                    Message = "Đăng xuất thành công",
                    LogoutTime = logoutTime,
                    UserId = logoutDto.UId
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đăng xuất: {ex.Message}", ex);
            }
        }

        public async Task<bool> InvalidateAllUserTokensAsync(int userId)
        {
            try
            {
                var user = await _authRepository.GetUserByIdAsync(userId);

                if (user != null)
                {
                    await _hubContext.Clients.User(user.UId.ToString()).SendAsync("ReceiveNotification", $"Tất cả các phiên đăng nhập của bạn đã bị vô hiệu hóa.");
                }

                await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Tất cả token của người dùng ID {userId} đã bị vô hiệu hóa.");

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error invalidating all tokens for user {userId}: {ex.Message}");
                return false;
            }
        }

        public string HashPassword(string plainPassword)
        {
            if (string.IsNullOrEmpty(plainPassword))
                throw new ArgumentException("Password không được để trống");

            var tempUser = new User();
            return _passwordHasher.HashPassword(tempUser, plainPassword);
        }

        public bool VerifyPassword(User user, string plainPassword, string hashedPassword)
        {
            if (string.IsNullOrEmpty(plainPassword) || string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                var result = _passwordHasher.VerifyHashedPassword(user, hashedPassword, plainPassword);
                return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public string GenerateJwtToken(User user)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret");

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.UId.ToString()),
                        new Claim(ClaimTypes.Email, user.UEmail ?? string.Empty),
                        new Claim("Role", user.RoleId?.ToString() ?? "0"),
                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo JWT token: {ex.Message}", ex);
            }
        }

        private async Task<FacilityInfoLoginDTO?> GetUserFacilityInfoAsync(User user)
        {
            try
            {
                if (IsStaff(user))
                {
                    var staff = await _authRepository.GetStaffByUserIdAsync(user.UId);
                    if (staff?.FacId != null)
                    {
                        return new FacilityInfoLoginDTO
                        {
                            FacId = staff.FacId,
                            FacilityName = staff.Fac?.Name
                        };
                    }
                }
                else if (IsFieldOwner(user))
                {
                    var fieldOwner = await _authRepository.GetFieldOwnerByUserIdAsync(user.UId);
                    if (fieldOwner?.Facilities != null && fieldOwner.Facilities.Any())
                    {
                        var facilityList = fieldOwner.Facilities.Select(f => new FacilityBasicDTO
                        {
                            FacId = f.FacId,
                            Name = f.Name,
                            Address = f.Address,
                            Description = f.Description
                        }).ToList();

                        return new FacilityInfoLoginDTO
                        {
                            Facilities = facilityList
                        };
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi lấy facility info: {ex.Message}");
                return null;
            }
        }

        private async Task<bool> ValidatePasswordAsync(User user, string plainPassword)
        {
            try
            {
                if (IsPasswordHashed(user.UPassword))
                {
                    if (VerifyPassword(user, plainPassword, user.UPassword))
                    {
                        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.UPassword, plainPassword);
                        if (verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
                        {
                            user.UPassword = HashPassword(plainPassword);
                            await _authRepository.UpdateUserAsync(user);
                        }
                        return true;
                    }
                }
                else
                {
                    if (user.UPassword == plainPassword)
                    {
                        user.UPassword = HashPassword(plainPassword);
                        await _authRepository.UpdateUserAsync(user);
                        return true;
                    }
                }
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private bool IsPasswordHashed(string password)
        {
            if (string.IsNullOrEmpty(password))
                return false;

            return password.Length >= 50 && !password.Contains(" ") &&
                    password.All(c => char.IsLetterOrDigit(c) || c == '+' || c == '/' || c == '=');
        }

        private async Task HandleExternalLoginRecordAsync(int userId, GoogleLoginDTO googleLoginDto)
        {
            try
            {
                var existingExternalLogin = await _authRepository.GetExternalLoginAsync(userId, "Google");

                if (existingExternalLogin == null)
                {
                    var externalLogin = new ExternalLogin
                    {
                        UId = userId,
                        ExternalProvider = "Google",
                        ExternalUserId = googleLoginDto.GoogleUserId,
                        AccessToken = googleLoginDto.AccessToken
                    };
                    await _authRepository.CreateExternalLoginAsync(externalLogin);
                }
                else
                {
                    existingExternalLogin.AccessToken = googleLoginDto.AccessToken;
                    existingExternalLogin.ExternalUserId = googleLoginDto.GoogleUserId;
                    await _authRepository.UpdateExternalLoginAsync(existingExternalLogin);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xử lý External login: {ex.Message}");
            }
        }

        private static readonly HashSet<string> _blacklistedTokens = new HashSet<string>();
        private static readonly Dictionary<string, DateTime> _tokenExpirations = new Dictionary<string, DateTime>();

        private async Task AddTokenToBlacklistAsync(string token, DateTime expiration)
        {
            await Task.Run(() =>
            {
                lock (_blacklistedTokens)
                {
                    _blacklistedTokens.Add(token);
                    _tokenExpirations[token] = expiration;
                }
            });

            await CleanupExpiredTokensAsync();
        }

        private async Task<bool> IsTokenBlacklistedAsync(string token)
        {
            return await Task.Run(() =>
            {
                lock (_blacklistedTokens)
                {
                    return _blacklistedTokens.Contains(token);
                }
            });
        }

        private async Task CleanupExpiredTokensAsync()
        {
            await Task.Run(() =>
            {
                lock (_blacklistedTokens)
                {
                    var now = DateTime.UtcNow;
                    var expiredTokens = _tokenExpirations
                        .Where(kvp => kvp.Value < now)
                        .Select(kvp => kvp.Key)
                        .ToList();

                    foreach (var expiredToken in expiredTokens)
                    {
                        _blacklistedTokens.Remove(expiredToken);
                        _tokenExpirations.Remove(expiredToken);
                    }
                }
            });
        }

        private async Task LogLogoutActivityAsync(int userId, DateTime logoutTime)
        {
            try
            {
                Console.WriteLine($"User {userId} logged out at {logoutTime}");
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error logging logout activity: {ex.Message}");
            }
        }

        public async Task<bool> InvalidateTokenAsync(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                    return false;

                var tokenHandler = new JwtSecurityTokenHandler();
                if (!tokenHandler.CanReadToken(token))
                    return false;

                var jwtToken = tokenHandler.ReadJwtToken(token);
                var userId = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                    return false;

                await AddTokenToBlacklistAsync(token, jwtToken.ValidTo);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error invalidating token: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                    return false;

                if (await IsTokenBlacklistedAsync(token))
                    return false;

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-256-bit-secret");

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}