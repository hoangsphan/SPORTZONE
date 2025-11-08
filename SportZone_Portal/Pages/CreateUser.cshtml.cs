using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using SportZone_API.Models;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Pages
{
    public class CreateUserModel : PageModel
    {
        private readonly SportZoneContext _context;

        public CreateUserModel(SportZoneContext context)
        {
            _context = context;
        }

        [BindProperty]
        public User User { get; set; }
        public SelectList Roles { get; set; }

        public IActionResult OnGet()
        {
            Roles = new SelectList(_context.Roles, "RoleID", "Name");
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                Roles = new SelectList(_context.Roles, "RoleID", "Name");
                return Page();
            }

            _context.Users.Add(User);
            await _context.SaveChangesAsync();

            return RedirectToPage("./UsersManager");
        }
    }
}
