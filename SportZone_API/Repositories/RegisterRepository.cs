using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic; 
using System.Threading.Tasks;

namespace SportZone_API.Repositories
{
    public class RegisterRepository : IRegisterRepository
    {
        private readonly SportZoneContext _context;

        public RegisterRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UEmail == email);
        }

        public async Task RegisterUserWithCustomerAsync(User user, Customer customer)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            customer.UId = user.UId;
            await _context.Customers.AddAsync(customer);
            await _context.SaveChangesAsync();
        }

        public async Task RegisterUserWithFieldOwnerAsync(User user, FieldOwner fieldOwner)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            fieldOwner.UId = user.UId;
            await _context.FieldOwners.AddAsync(fieldOwner);
            await _context.SaveChangesAsync();
        }

        public async Task RegisterUserWithStaffAsync(User user, Staff staff)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            staff.UId = user.UId;
            await _context.Staff.AddAsync(staff);
            await _context.SaveChangesAsync();
        }

        public async Task RegisterUserWithAdminAsync(User user, Admin admin)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            admin.UId = user.UId;
            await _context.Admins.AddAsync(admin);
            await _context.SaveChangesAsync();
        }
    }
}