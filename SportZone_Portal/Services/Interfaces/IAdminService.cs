using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IAdminService
    {
        Task<List<User>> GetAllAccount();
        Task<List<User>> SearchUsers(SearchUserDto searchDto);
        Task<User> CreateAccount(CreateAccountDto createAccountDto);
    }
}
