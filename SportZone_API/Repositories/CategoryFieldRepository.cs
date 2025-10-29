using Microsoft.EntityFrameworkCore;
using SportZone_API.Models; 
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Repositories
{
    public class CategoryFieldRepository : ICategoryFieldRepository
    {
        private readonly SportZoneContext _context; 

        public CategoryFieldRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<CategoryField?> GetByIdAsync(int id)
        {
            return await _context.CategoryFields.FirstOrDefaultAsync(cf => cf.CategoryFieldId == id);
        }

        public async Task<IEnumerable<CategoryField>> GetAllAsync()
        {
            return await _context.CategoryFields.ToListAsync();
        }
    }
}