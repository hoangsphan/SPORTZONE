using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SportZone_API.Pages
{
    public class BookingHistoryModel : PageModel
    {
        private readonly SportZoneContext _context;

        public BookingHistoryModel(SportZoneContext context)
        {
            _context = context;
        }

        public IList<Booking> BookingList { get;set; }

        public async Task OnGetAsync()
        {
            var userId = User.FindFirstValue("UId");
            if (userId != null)
            {
                var bookings = from b in _context.Bookings
                               where b.UserID == int.Parse(userId)
                               select b;

                BookingList = await bookings.Include(b => b.Field).ThenInclude(f => f.Facility).ToListAsync();
            }
        }
    }
}
