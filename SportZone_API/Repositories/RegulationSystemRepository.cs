using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class RegulationSystemRepository : IRegulationSystemRepository
    {
        private readonly SportZoneContext _context;

        public RegulationSystemRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<RegulationSystem>> GetAllAsync()
        {
            return await _context.RegulationSystems.ToListAsync();
        }

        public async Task<RegulationSystem?> GetByIdAsync(int id)
        {
            return await _context.RegulationSystems.FindAsync(id);
        }

        public async Task AddAsync(RegulationSystem regulationSystem)
        {
            regulationSystem.CreateAt = DateTime.Now;
            regulationSystem.UpdateAt = DateTime.Now;
            await _context.RegulationSystems.AddAsync(regulationSystem);
        }

        public async Task UpdateAsync(RegulationSystem regulationSystem)
        {
            regulationSystem.UpdateAt = DateTime.Now;
            _context.RegulationSystems.Update(regulationSystem);
        }

        public async Task DeleteAsync(RegulationSystem regulationSystem)
        {
            _context.RegulationSystems.Remove(regulationSystem);
        }

        public async Task<List<RegulationSystem>> SearchAsync(string text)
        {
            return await _context.RegulationSystems
                .Where(r => (r.Title ?? "").Contains(text) ||
                            (r.Description ?? "").Contains(text) ||
                            (r.Status ?? "").Contains(text))
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}