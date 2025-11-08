using SportZone_API.Models;
using System.Collections.Generic; 
using System.Threading.Tasks;

namespace SportZone_API.Repositories.Interfaces
{
    public interface ICategoryFieldRepository
    {
        Task<CategoryField?> GetByIdAsync(int id);
        Task<IEnumerable<CategoryField>> GetAllAsync(); 
    }
}