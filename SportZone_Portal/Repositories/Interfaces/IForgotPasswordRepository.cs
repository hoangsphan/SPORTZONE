using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IForgotPasswordRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task SaveUserAsync();
    }
}