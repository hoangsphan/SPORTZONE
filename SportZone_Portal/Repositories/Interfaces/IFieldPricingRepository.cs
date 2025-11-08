using SportZone_API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IFieldPricingRepository
    {
        Task<IEnumerable<FieldPricing>> GetAllPricingConfigsAsync();
        Task<FieldPricing?> GetPricingConfigByIdAsync(int id);
        Task<IEnumerable<FieldPricing>> GetPricingConfigsByFieldIdAsync(int fieldId);

        Task AddPricingConfigAsync(FieldPricing pricingConfig);
        Task UpdatePricingConfigAsync(FieldPricing pricingConfig);
        Task<bool> DeletePricingConfigAsync(int id);
    }
}