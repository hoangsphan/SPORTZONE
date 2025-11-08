using SportZone_API.DTOs;

namespace SportZone_API.Services.Interfaces
{
    public interface IFacilityService
    {
        Task<ServiceResponse<List<FacilityDto>>> GetAllFacilities(string? searchText = null);
        Task<ServiceResponse<List<FacilityDetailDto>>> GetAllFacilitiesWithDetails(string? searchText = null);
        Task<ServiceResponse<List<FacilityDetailDto>>> GetFacilitiesByFilter(string? categoryFieldName = null, string? address = null);
        Task<ServiceResponse<List<FacilityDto>>> GetFacilitiesByUserId(int userId);
        Task<FacilityDto?> GetFacilityById(int id);
        Task<ServiceResponse<FacilityDto>> CreateFacility(FacilityDto dto);
        Task<ServiceResponse<FacilityDto>> UpdateFacility(int id, FacilityUpdateDto dto);
        Task<ServiceResponse<object>> DeleteFacility(int id);
        Task<ServiceResponse<IEnumerable<string>>> GetCategoryFieldNamesByFacilityId(int facilityId);
    }
}