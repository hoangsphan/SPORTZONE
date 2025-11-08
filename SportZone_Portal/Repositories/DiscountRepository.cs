using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.DTOs;
using AutoMapper;

namespace SportZone_API.Repositories
{
    public class DiscountRepository : IDiscountRepository
    {
        private readonly SportZoneContext _context;
        private readonly IMapper _mapper;

        public DiscountRepository(SportZoneContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<Discount>> GetAllAsync()
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .ToListAsync();
        }

        public async Task<Discount?> GetByIdAsync(int id)
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .FirstOrDefaultAsync(d => d.DiscountId == id);
        }

        public async Task<List<Discount>> GetByFacilityIdAsync(int facId)
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => d.FacId == facId)
                .ToListAsync();
        }

        public async Task<List<Discount>> GetActiveDiscountsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => d.IsActive == true &&
                           d.StartDate <= today &&
                           d.EndDate >= today &&
                           d.Quantity > 0)
                .ToListAsync();
        }

        public async Task<List<Discount>> GetActiveDiscountsByFacilityAsync(int facId)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => d.FacId == facId &&
                           d.IsActive == true &&
                           d.StartDate <= today &&
                           d.EndDate >= today &&
                           d.Quantity > 0)
                .ToListAsync();
        }

        public async Task AddAsync(Discount discount)
        {
            await _context.Discounts.AddAsync(discount);
        }

        public async Task UpdateAsync(Discount discount)
        {
            _context.Discounts.Update(discount);
        }

        public async Task DeleteAsync(Discount discount)
        {
            _context.Discounts.Remove(discount);
        }

        public async Task<List<Discount>> SearchAsync(string text)
        {
            return await _context.Discounts
                .Include(d => d.Fac)
                .Where(d => (d.Description ?? "").Contains(text))
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ValidateDiscountAsync(int discountId, int facId)
        {
            try
            {
                var currentDate = DateOnly.FromDateTime(DateTime.Now);

                var discount = await _context.Discounts
                    .FirstOrDefaultAsync(d => d.DiscountId == discountId &&
                                             d.FacId == facId &&
                                             d.IsActive == true &&
                                             d.StartDate <= currentDate &&
                                             d.EndDate >= currentDate &&
                                             (d.Quantity == null || d.Quantity > 0));

                return discount != null;
            }
            catch (Exception ex)
            {
                throw new Exception($"L?i khi validate Discount: {ex.Message}", ex);
            }
        }
        public async Task<bool> DecreaseDiscountQuantityAsync(int discountId)
        {
            try
            {
                var discount = await _context.Discounts.FindAsync(discountId);
                if (discount == null)
                    return false;

                // Ch? gi?m quantity n?u có quantity và > 0
                if (discount.Quantity.HasValue && discount.Quantity.Value > 0)
                {
                    discount.Quantity = discount.Quantity.Value - 1;
                    _context.Discounts.Update(discount);
                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"L?i khi gi?m quantity Discount: {ex.Message}", ex);
            }
        }

        public async Task<DiscountDTO?> GetDiscountByIdAsync(int discountId)
        {
            try
            {
                var discount = await _context.Discounts
                    .Include(d => d.Fac)
                    .FirstOrDefaultAsync(d => d.DiscountId == discountId);

                return discount != null ? _mapper.Map<DiscountDTO>(discount) : null;
            }
            catch (Exception ex)
            {
                throw new Exception($"L?i khi l?y Discount: {ex.Message}", ex);
            }
        }
    }
}