using SportZone_API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IStaffRepository
    {
        Task<IEnumerable<Staff>> GetStaffByFacilityIdAsync(int facilityId);
        Task UpdateStaffAsync(Staff staff);
        Task DeleteStaffAsync(Staff staff);
        Task<Staff?> GetByUIdAsync(int uId);
        Task<IEnumerable<Staff>> GetAllStaffAsync();
        Task<List<Staff>> GetStaffByFieldOwnerIdAsync(int fieldOwnerId);
    }
}