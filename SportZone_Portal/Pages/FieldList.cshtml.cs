using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Pages
{
    public class FieldListModel : PageModel
    {
        private readonly SportZoneContext _context;

        public FieldListModel(SportZoneContext context)
        {
            _context = context;
        }

        public IList<Field> FieldList { get;set; }
        public SelectList Categories { get; set; }

        public async Task OnGetAsync(string searchTerm, string fieldType)
        {
            IQueryable<string> categoryQuery = from c in _context.Categories
                                               orderby c.Name
                                               select c.Name;

            var fields = from f in _context.Fields
                         select f;

            if (!string.IsNullOrEmpty(searchTerm))
            {
                fields = fields.Where(s => s.Name.Contains(searchTerm) || s.Location.Contains(searchTerm));
            }

            if (!string.IsNullOrEmpty(fieldType) && fieldType != "all")
            {
                fields = fields.Where(f => f.CategoryFields.Any(cf => cf.Category.Name == fieldType));
            }

            Categories = new SelectList(await categoryQuery.Distinct().ToListAsync());
            FieldList = await fields.ToListAsync();
        }
    }
}
