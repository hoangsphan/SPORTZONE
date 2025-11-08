using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IFieldRepository
    {
        Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync();
        Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync(string? searchTerm);
        Task<FieldResponseDTO?> GetFieldByIdAsync(int fieldId);
        Task<Field?> GetFieldEntityByIdAsync(int fieldId);
        Task<IEnumerable<FieldResponseDTO>> GetFieldsByFacilityAsync(int facId);
        Task<IEnumerable<FieldResponseDTO>> GetFieldsByCategoryAsync(int categoryId);
        Task<IEnumerable<FieldResponseDTO>> GetFieldsByUserIdAsync(int userId);
        Task<IEnumerable<FieldScheduleDTO>> GetFieldScheduleByFieldIdAsync(int fieldId);
        Task<Field> CreateFieldAsync(FieldCreateDTO fieldDto);
        Task<bool> UpdateFieldAsync(int fieldId, FieldUpdateDTO fieldDto);
        Task<bool> DeleteFieldAsync(int fieldId);
        Task<bool> FieldExistsAsync(int fieldId);
        Task<bool> FacilityExistsAsync(int facId);
        Task<bool> CategoryExistsAsync(int categoryId);
        Task<bool> FieldNameExistsInFacilityAsync(string fieldName, int facId);
    }
}