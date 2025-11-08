using SportZone_API.Models;
using SportZone_API.DTOs;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IDiscountRepository
    {
        Task<List<Discount>> GetAllAsync();
        Task<Discount?> GetByIdAsync(int id);
        Task<List<Discount>> GetByFacilityIdAsync(int facId);
        Task<List<Discount>> GetActiveDiscountsAsync();
        Task<List<Discount>> GetActiveDiscountsByFacilityAsync(int facId);
        Task AddAsync(Discount discount);
        Task UpdateAsync(Discount discount);
        Task DeleteAsync(Discount discount);
        Task<List<Discount>> SearchAsync(string text);
        Task SaveChangesAsync();
        Task<bool> ValidateDiscountAsync(int discountId, int facId);
        Task<bool> DecreaseDiscountQuantityAsync(int discountId);
        Task<DiscountDTO?> GetDiscountByIdAsync(int discountId);
    }
} 