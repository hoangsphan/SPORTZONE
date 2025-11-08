using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Pages
{
    public class UsersManagerModel : PageModel
    {
        private readonly SportZoneContext _context;

        public UsersManagerModel(SportZoneContext context)
        {
            _context = context;
        }

        public IList<User> UserList { get;set; }

        public async Task OnGetAsync(string searchTerm)
        {
            var users = _context.Users.Include(u => u.Role)
                                     .Include(u => u.Admin)
                                     .Include(u => u.Customer)
                                     .Include(u => u.FieldOwner)
                                     .Include(u => u.Staff)
                                     .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                users = users.Where(u => u.UEmail.Contains(searchTerm) ||
                                         (u.Admin != null && u.Admin.Name.Contains(searchTerm)) ||
                                         (u.Customer != null && u.Customer.Name.Contains(searchTerm)) ||
                                         (u.FieldOwner != null && u.FieldOwner.Name.Contains(searchTerm)) ||
                                         (u.Staff != null && u.Staff.Name.Contains(searchTerm)));
            }

            UserList = await users.ToListAsync();
        }
    }
}
