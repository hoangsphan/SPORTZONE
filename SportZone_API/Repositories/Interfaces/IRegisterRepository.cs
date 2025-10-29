using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IRegisterRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task RegisterUserWithCustomerAsync(User user, Customer customer);
        Task RegisterUserWithFieldOwnerAsync(User user, FieldOwner fieldOwner);
        Task RegisterUserWithStaffAsync(User user, Staff staff);
        Task RegisterUserWithAdminAsync(User user, Admin admin);
    }
}