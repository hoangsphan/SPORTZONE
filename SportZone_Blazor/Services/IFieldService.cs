using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public interface IFieldService
{
    Task<IReadOnlyList<FieldSummaryModel>> GetFieldsAsync(string? searchTerm = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FieldSummaryModel>> GetFieldsForFacilityAsync(int facilityId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FieldScheduleModel>> GetScheduleForFieldAsync(int fieldId, CancellationToken cancellationToken = default);
}
