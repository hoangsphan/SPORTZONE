using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Repositories
{
    public class FieldPricingRepository : IFieldPricingRepository
    {
        private readonly SportZoneContext _context;

        public FieldPricingRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FieldPricing>> GetAllPricingConfigsAsync()
        {
            return await _context.FieldPricings.ToListAsync();
        }

        public async Task<FieldPricing?> GetPricingConfigByIdAsync(int id)
        {
            return await _context.FieldPricings.FindAsync(id);
        }

        public async Task<IEnumerable<FieldPricing>> GetPricingConfigsByFieldIdAsync(int fieldId)
        {
            return await _context.FieldPricings
                                 .Where(tp => tp.FieldId == fieldId)
                                 .ToListAsync();
        }

        public async Task AddPricingConfigAsync(FieldPricing pricingConfig)
        {
            await _context.FieldPricings.AddAsync(pricingConfig);
            await _context.SaveChangesAsync();
        }

        public async Task UpdatePricingConfigAsync(FieldPricing pricingConfig)
        {
            _context.FieldPricings.Update(pricingConfig);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeletePricingConfigAsync(int id)
        {
            var config = await _context.FieldPricings.FindAsync(id);
            if (config == null)
            {
                return false;
            }
            _context.FieldPricings.Remove(config);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}