using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IRegulationSystemService
    {
        Task<List<RegulationSystem>> GetAllRegulationSystems();
        Task<RegulationSystem?> GetRegulationSystemById(int id);
        Task<ServiceResponse<RegulationSystem>> CreateRegulationSystem(RegulationSystemDto dto);
        Task<ServiceResponse<RegulationSystem>> UpdateRegulationSystem(int id, RegulationSystemDto dto);
        Task<ServiceResponse<RegulationSystem>> DeleteRegulationSystem(int id);
        Task<List<RegulationSystem>> SearchRegulationSystems(string text);
    }
}