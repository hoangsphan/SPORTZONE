using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class RegulationFacilityRepository : IRegulationFacilityRepository
    {
        private readonly SportZoneContext _context;

        public RegulationFacilityRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<RegulationFacility>> GetAllAsync()
        {
            return await _context.RegulationFacilities
                .Include(rf => rf.Fac)
                .ToListAsync();
        }

        public async Task<RegulationFacility?> GetByIdAsync(int id)
        {
            return await _context.RegulationFacilities
                .Include(rf => rf.Fac)
                .FirstOrDefaultAsync(rf => rf.RegulationFacilityId == id);
        }

        public async Task<List<RegulationFacility>> GetByFacilityIdAsync(int facId)
        {
            return await _context.RegulationFacilities
                .Include(rf => rf.Fac)
                .Where(rf => rf.FacId == facId)
                .ToListAsync();
        }

        public async Task AddAsync(RegulationFacility regulationFacility)
        {
            regulationFacility.CreateAt = DateTime.Now;
            regulationFacility.UpdateAt = DateTime.Now;
            await _context.RegulationFacilities.AddAsync(regulationFacility);
        }

        public async Task UpdateAsync(RegulationFacility regulationFacility)
        {
            regulationFacility.UpdateAt = DateTime.Now;
            _context.RegulationFacilities.Update(regulationFacility);
        }

        public async Task DeleteAsync(RegulationFacility regulationFacility)
        {
            _context.RegulationFacilities.Remove(regulationFacility);
        }

        public async Task<List<RegulationFacility>> SearchAsync(string text)
        {
            return await _context.RegulationFacilities
                .Include(rf => rf.Fac)
                .Where(rf => (rf.Title ?? "").Contains(text) ||
                             (rf.Description ?? "").Contains(text) ||
                             (rf.Status ?? "").Contains(text))
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}