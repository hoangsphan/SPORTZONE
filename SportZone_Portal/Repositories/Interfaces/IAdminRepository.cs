using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IAdminRepository
    {
        Task<List<User>> GetAllAccountAsync();
        Task<List<User>> SearchUsersAsync(SearchUserDto searchDto);
        Task<User> CreateAccountAsync(CreateAccountDto createAccountDto, string hashedPassword);
        Task<bool> IsEmailExistAsync(string email);
    }
}
