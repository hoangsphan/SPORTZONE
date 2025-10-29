using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IRegulationSystemRepository
    {
        Task<List<RegulationSystem>> GetAllAsync();
        Task<RegulationSystem?> GetByIdAsync(int id);
        Task AddAsync(RegulationSystem regulationSystem);
        Task UpdateAsync(RegulationSystem regulationSystem);
        Task DeleteAsync(RegulationSystem regulationSystem);
        Task<List<RegulationSystem>> SearchAsync(string text);
        Task SaveChangesAsync();
    }
}