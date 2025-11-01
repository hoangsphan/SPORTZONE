using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public interface IFacilityService
{
    Task<IReadOnlyList<FacilitySummaryModel>> GetFacilitiesAsync(string? searchTerm = null, CancellationToken cancellationToken = default);

    Task<FacilityDetailModel?> GetFacilityAsync(int facilityId, CancellationToken cancellationToken = default);
}
