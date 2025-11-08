using SportZone_API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Services.Interfaces
{
    public interface ICategoryFieldService
    {
        Task<ServiceResponse<CategoryFieldDto>> GetCategoryFieldById(int id);
        Task<ServiceResponse<string>> GetCategoryFieldNameById(int id);
        Task<ServiceResponse<IEnumerable<CategoryFieldDto>>> GetAllCategoryFields();
    }
}