using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using SportZone_API.Helpers;
using System.IO;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.Hubs;

namespace SportZone_API.Services
{
    public class RegisterService : IRegisterService
    {
        private readonly IRegisterRepository _repository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IMapper _mapper;
        private readonly IFacilityRepository _facilityRepository;
        private readonly SportZoneContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IHubContext<NotificationHub> _hubContext;

        public RegisterService(
            IRegisterRepository repository,
            IPasswordHasher<User> passwordHasher,
            IMapper mapper,
            IFacilityRepository facilityRepository,
            SportZoneContext context,
            IWebHostEnvironment env,
            IHubContext<NotificationHub> hubContext)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _mapper = mapper;
            _facilityRepository = facilityRepository;
            _context = context;
            _env = env;
            _hubContext = hubContext;
        }

        public async Task<ServiceResponse<string>> RegisterUserAsync(RegisterDto dto)
        {
            // Các thông báo lỗi sẽ được trả về trực tiếp, không gửi qua SignalR
            if (!IsValidPhoneNumber(dto.Phone))
            {
                return Fail("Định dạng số điện thoại không hợp lệ.");
            }

            if (!IsValidEmail(dto.Email))
            {
                return Fail("Định dạng email không hợp lệ.");
            }

            if (!IsValidPassword(dto.Password))
            {
                return Fail("Mật khẩu phải dài ít nhất 10 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
            }

            var existing = await _repository.GetUserByEmailAsync(dto.Email);
            if (existing != null)
            {
                return Fail($"Email '{dto.Email}' đã tồn tại.");
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == dto.RoleName);
            if (role == null)
            {
                return Fail($"Tên vai trò '{dto.RoleName}' không hợp lệ. Vui lòng chọn 'Customer', 'Field Owner' hoặc 'Staff'.");
            }

            if (dto.RoleName == "Customer")
            {
                if (dto.FacId.HasValue || dto.Dob.HasValue || dto.ImageFile != null || dto.StartTime.HasValue || dto.EndTime.HasValue)
                {
                    return Fail("Vai trò 'Customer' không được phép nhập các thông tin của nhân viên.");
                }

                var user = _mapper.Map<User>(dto);
                user.RoleId = role.RoleId;
                user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

                var customer = _mapper.Map<Customer>(dto);
                await _repository.RegisterUserWithCustomerAsync(user, customer);
                await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Người dùng mới '{dto.Email}' đã đăng ký với vai trò Customer.");
                return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản khách hàng thành công." };
            }
            else if (dto.RoleName == "Field_Owner")
            {
                if (dto.FacId.HasValue || dto.Dob.HasValue || dto.ImageFile != null || dto.StartTime.HasValue || dto.EndTime.HasValue)
                {
                    return Fail("Vai trò 'Field Owner' không được phép nhập các thông tin của nhân viên.");
                }

                var user = _mapper.Map<User>(dto);
                user.RoleId = role.RoleId;
                user.UStatus = "Active";
                user.UPassword = _passwordHasher.HashPassword(user, dto.Password);

                var fieldOwner = _mapper.Map<FieldOwner>(dto);
                await _repository.RegisterUserWithFieldOwnerAsync(user, fieldOwner);
                await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Chủ sân mới '{dto.Email}' đã đăng ký. Vui lòng xác minh.");
                return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản chủ sân thành công." };
            }
            else if (dto.RoleName == "Admin")
            {
                var user = _mapper.Map<User>(dto);
                user.RoleId = role.RoleId;
                user.UPassword = _passwordHasher.HashPassword(user, dto.Password);
                user.UStatus = "Active";

                var admin = _mapper.Map<Admin>(dto);
                await _repository.RegisterUserWithAdminAsync(user, admin);

                return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản Admin thành công." };
            }

            else if (dto.RoleName == "Staff")
            {
                if (!dto.FacId.HasValue || dto.FacId.Value <= 0)
                {
                    return Fail("Vui lòng cung cấp FacId hợp lệ cho nhân viên.");
                }
                if (!dto.Dob.HasValue)
                {
                    return Fail("Ngày sinh không được để trống cho nhân viên.");
                }
                if (dto.StartTime.HasValue)
                {
                    var currentDate = DateOnly.FromDateTime(DateTime.Now);
                    var startDate = dto.StartTime.Value;
                    if (startDate < currentDate)
                    {
                        return Fail("Thời gian bắt đầu làm việc không thể ở trong quá khứ.");
                    }
                }

                if (dto.StartTime.HasValue && dto.EndTime.HasValue && dto.StartTime.Value >= dto.EndTime.Value)
                {
                    return Fail("Thời gian kết thúc phải lớn hơn thời gian bắt đầu làm việc.");
                }

                var facility = await _facilityRepository.GetByIdAsync(dto.FacId.Value);
                if (facility == null)
                {
                    return Fail($"Không tìm thấy cơ sở với FacId '{dto.FacId.Value}'. Vui lòng cung cấp FacId hợp lệ.");
                }

                string? imageUrl = null;
                if (dto.ImageFile != null)
                {
                    const string subFolderName = "StaffImages";
                    var (isValid, errorMessage) = ImageUpload.ValidateImage(dto.ImageFile);
                    if (!isValid)
                    {
                        return Fail(errorMessage);
                    }
                    imageUrl = await ImageUpload.SaveImageAsync(dto.ImageFile, _env.WebRootPath, subFolderName);
                    if (imageUrl == null)
                    {
                        return Fail("Lỗi khi lưu file ảnh.");
                    }
                }

                try
                {
                    var user = _mapper.Map<User>(dto);
                    user.RoleId = role.RoleId;
                    user.UPassword = _passwordHasher.HashPassword(user, dto.Password);
                    user.UStatus = "Active";

                    var staff = _mapper.Map<Staff>(dto);
                    staff.Image = imageUrl;
                    await _repository.RegisterUserWithStaffAsync(user, staff);
                    await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Nhân viên mới '{dto.Email}' đã được đăng ký cho cơ sở '{facility.Name}'.");
                    return new ServiceResponse<string> { Success = true, Message = "Đăng ký tài khoản nhân viên thành công." };
                }
                catch (Exception ex)
                {
                    if (!string.IsNullOrEmpty(imageUrl))
                    {
                        ImageUpload.DeleteImage(imageUrl, _env.WebRootPath);
                    }

                    return Fail($"Đã xảy ra lỗi khi đăng ký: {ex.Message}");
                }
            }
            else
            {
                return Fail("Tên vai trò không hợp lệ.");
            }
        }

        private static ServiceResponse<string> Fail(string msg) => new() { Success = false, Message = msg };

        private static bool IsValidPhoneNumber(string phoneNumber)
        {
            var phonePattern = @"^[\+]?[0-9]?[\(\)\-\s\.]*[0-9]{8,15}$";
            return Regex.IsMatch(phoneNumber, phonePattern);
        }

        private static bool IsValidEmail(string email)
        {
            var emailPattern = @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$";
            return Regex.IsMatch(email, emailPattern);
        }

        public static bool IsValidPassword(string password)
        {
            if (password.Length < 10) return false;
            if (!Regex.IsMatch(password, @"[A-Z]")) return false;
            if (!Regex.IsMatch(password, @"[a-z]")) return false;
            if (!Regex.IsMatch(password, @"[0-9]")) return false;
            if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{}:;""'<>,.?/]")) return false;
            return true;
        }
    }
}