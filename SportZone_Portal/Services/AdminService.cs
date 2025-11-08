using Microsoft.AspNetCore.Identity;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class AdminService : IAdminService
    {
        public IAdminRepository _adminRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AdminService(IAdminRepository adminRepository, IPasswordHasher<User> passwordHasher)
        {
            _adminRepository = adminRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<List<User>> GetAllAccount()
        {
            try
            {
                return await _adminRepository.GetAllAccountAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách tài khoản: {ex.Message}", ex);
            }
        }

        public async Task<List<User>> SearchUsers(SearchUserDto searchDto)
        {
            try
            {
                if (searchDto == null)
                {
                    throw new ArgumentNullException(nameof(searchDto), "Search parameters không được null");
                }

                return await _adminRepository.SearchUsersAsync(searchDto);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi tìm kiếm tài khoản: {ex.Message}", ex);
            }
        }

        public async Task<User> CreateAccount(CreateAccountDto createAccountDto)
        {
            try
            {
                if (createAccountDto == null)
                {
                    throw new ArgumentNullException(nameof(createAccountDto), "Dữ liệu tạo tài khoản không được null");
                }

                
                var emailExists = await _adminRepository.IsEmailExistAsync(createAccountDto.Email);
                if (emailExists)
                {
                    throw new Exception("Email đã tồn tại trong hệ thống");
                }

                
                if (createAccountDto.RoleId < 1 || createAccountDto.RoleId > 4)
                {
                    throw new Exception("RoleId không hợp lệ. RoleId phải từ 1-4");
                }

                
                if (createAccountDto.RoleId == 4 && !createAccountDto.FacilityId.HasValue)
                {
                    throw new Exception("Staff phải có FacilityId");
                }

                
                var tempUser = new User(); 
                var hashedPassword = _passwordHasher.HashPassword(tempUser, createAccountDto.Password);

               
                var createdUser = await _adminRepository.CreateAccountAsync(createAccountDto, hashedPassword);

                return createdUser;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi tạo tài khoản: {ex.Message}", ex);
            }
        }
    }
}
