using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IDiscountService
    {
        Task<List<Discount>> GetAllDiscounts();
        Task<Discount?> GetDiscountById(int id);
        Task<List<Discount>> GetDiscountsByFacilityId(int facId);
        Task<List<Discount>> GetActiveDiscounts();
        Task<List<Discount>> GetActiveDiscountsByFacility(int facId);
        Task<ServiceResponse<Discount>> CreateDiscount(DiscountDto dto);
        Task<ServiceResponse<Discount>> UpdateDiscount(int id, DiscountDto dto);
        Task<ServiceResponse<Discount>> DeleteDiscount(int id);
        Task<List<Discount>> SearchDiscounts(string text);
        Task<decimal> CalculateDiscountedPriceAsync(decimal originalPrice, int? discountId, int facId);
        Task<bool> DecreaseDiscountQuantityAsync(int discountId);
    }
}