using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly SportZoneContext _context;

        public AdminRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllAccountAsync()
        {
            try
            {
                var user = await _context.Users.Include(u => u.Customer)
                    .Include(u => u.FieldOwner).Include(u => u.Staff).ToListAsync();
                return user;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách tài khoản: {ex.Message}", ex);
            }
        }

        public async Task<List<User>> SearchUsersAsync(SearchUserDto searchDto)
        {
            try
            {
                var query = _context.Users
                    .Include(u => u.Customer)
                    .Include(u => u.FieldOwner)
                    .Include(u => u.Staff)
                    .Include(u => u.Role)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchDto.Email))
                {
                    query = query.Where(u => u.UEmail.Contains(searchDto.Email));
                }

                if (!string.IsNullOrEmpty(searchDto.Name))
                {
                    query = query.Where(u => 
                        (u.Customer != null && u.Customer.Name.Contains(searchDto.Name)) ||
                        (u.FieldOwner != null && u.FieldOwner.Name.Contains(searchDto.Name)) ||
                        (u.Staff != null && u.Staff.Name.Contains(searchDto.Name)));
                }

                if (!string.IsNullOrEmpty(searchDto.Phone))
                {
                    query = query.Where(u => 
                        (u.Customer != null && u.Customer.Phone.Contains(searchDto.Phone)) ||
                        (u.FieldOwner != null && u.FieldOwner.Phone.Contains(searchDto.Phone)) ||
                        (u.Staff != null && u.Staff.Phone.Contains(searchDto.Phone)));
                }

                if (!string.IsNullOrEmpty(searchDto.Status))
                {
                    query = query.Where(u => u.UStatus == searchDto.Status);
                }

                if (searchDto.RoleId.HasValue)
                {
                    query = query.Where(u => u.RoleId == searchDto.RoleId.Value);
                }

                var users = await query.OrderBy(u => u.UId).ToListAsync();

                return users;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm kiếm tài khoản: {ex.Message}", ex);
            }
        }

        public async Task<bool> IsEmailExistAsync(string email)
        {
            try
            {
                return await _context.Users.AnyAsync(u => u.UEmail == email);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi kiểm tra email: {ex.Message}", ex);
            }
        }

        public async Task<User> CreateAccountAsync(CreateAccountDto createAccountDto, string hashedPassword)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    UEmail = createAccountDto.Email,
                    UPassword = hashedPassword,
                    RoleId = createAccountDto.RoleId,
                    UStatus = createAccountDto.Status ?? "Active",
                    UCreateDate = DateTime.Now,
                    IsExternalLogin = false,
                    IsVerify = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                switch (createAccountDto.RoleId)
                {
                    case 1: 
                        var admin = new Admin
                        {
                            UId = user.UId,
                            Name = createAccountDto.Name,
                            Phone = createAccountDto.Phone
                        };
                        _context.Admins.Add(admin);
                        break;

                    case 2: 
                        var customer = new Customer
                        {
                            UId = user.UId,
                            Name = createAccountDto.Name,
                            Phone = createAccountDto.Phone
                        };
                        _context.Customers.Add(customer);
                        break;

                    case 3: 
                        var fieldOwner = new FieldOwner
                        {
                            UId = user.UId,
                            Name = createAccountDto.Name,
                            Phone = createAccountDto.Phone
                        };
                        _context.FieldOwners.Add(fieldOwner);
                        break;

                    case 4: 
                        var staff = new Staff
                        {
                            UId = user.UId,
                            FacId = createAccountDto.FacilityId,
                            Name = createAccountDto.Name,
                            Phone = createAccountDto.Phone,
                            Image = createAccountDto.Image,
                            StartTime = createAccountDto.StartTime.HasValue ? DateOnly.FromDateTime(createAccountDto.StartTime.Value) : null,
                            EndTime = createAccountDto.EndTime.HasValue ? DateOnly.FromDateTime(createAccountDto.EndTime.Value) : null
                        };
                        _context.Staff.Add(staff);
                        break;

                    default:
                        throw new Exception("RoleId không hợp lệ");
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var createdUser = await _context.Users
                    .Include(u => u.Customer)
                    .Include(u => u.FieldOwner)
                    .Include(u => u.Staff)
                    .Include(u => u.Admin)
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.UId == user.UId);

                return createdUser!;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Lỗi khi tạo tài khoản: {ex.Message}", ex);
            }
        }
    }
}
