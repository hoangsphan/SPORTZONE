using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly SportZoneContext _context;

        public AuthRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmailAsync(string email, bool isExternalLogin = false)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Customer)
                    .Include(u => u.Staff)
                    .Include(u => u.Admin)
                    .Include(u => u.FieldOwner)
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.UEmail == email && u.IsExternalLogin == isExternalLogin);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm user theo email: {ex.Message}", ex);
            }
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.Customer)
                    .Include(u => u.Staff)
                    .Include(u => u.Admin)
                    .Include(u => u.FieldOwner)
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.UId == userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm user theo ID: {ex.Message}", ex);
            }
        }

        public async Task<User> CreateUserAsync(User user)
        {
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return user;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo user mới: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật user: {ex.Message}", ex);
            }
        }

        public async Task<ExternalLogin?> GetExternalLoginAsync(int userId, string provider)
        {
            try
            {
                return await _context.ExternalLogins
                    .FirstOrDefaultAsync(el => el.UId == userId && el.ExternalProvider == provider);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm external login: {ex.Message}", ex);
            }
        }

        public async Task<ExternalLogin> CreateExternalLoginAsync(ExternalLogin externalLogin)
        {
            try
            {
                _context.ExternalLogins.Add(externalLogin);
                await _context.SaveChangesAsync();
                return externalLogin;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo external login: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateExternalLoginAsync(ExternalLogin externalLogin)
        {
            try
            {
                _context.ExternalLogins.Update(externalLogin);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật external login: {ex.Message}", ex);
            }
        }

       public async Task<Role?> GetCustomerRoleIdByNameAsync()
       {
            try
            {
                return await _context.Roles
                    .FirstOrDefaultAsync(r => r.RoleName == "Customer");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm role theo tên: {ex.Message}", ex);
            }
       }

        public async Task<Staff?> GetStaffByUserIdAsync(int userId)
        {
            try
            {
                return await _context.Staff
                    .Include(s => s.Fac) // Include facility info for Staff
                       // .ThenInclude(f => f.UIdNavigation) // Include FieldOwner info (chỉ name và phone)
                    .FirstOrDefaultAsync(s => s.UId == userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm staff theo user ID: {ex.Message}", ex);
            }
        }

        public async Task<FieldOwner?> GetFieldOwnerByUserIdAsync(int userId)
        {
            try
            {
                return await _context.FieldOwners
                    .Include(fo => fo.Facilities) // Include owned facilities
                    .FirstOrDefaultAsync(fo => fo.UId == userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm field owner theo user ID: {ex.Message}", ex);
            }
        }

        public async Task<List<Facility>> GetFacilitiesByOwnerIdAsync(int ownerId)
        {
            try
            {
                return await _context.Facilities
                    .Where(f => f.UId == ownerId)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách facility theo owner ID: {ex.Message}", ex);
            }
        }
    }
}