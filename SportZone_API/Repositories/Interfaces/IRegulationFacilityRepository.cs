using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IRegulationFacilityRepository
    {
        Task<List<RegulationFacility>> GetAllAsync();
        Task<RegulationFacility?> GetByIdAsync(int id);
        Task<List<RegulationFacility>> GetByFacilityIdAsync(int facId);
        Task AddAsync(RegulationFacility regulationFacility);
        Task UpdateAsync(RegulationFacility regulationFacility);
        Task DeleteAsync(RegulationFacility regulationFacility);
        Task<List<RegulationFacility>> SearchAsync(string text);
        Task SaveChangesAsync();
    }
}