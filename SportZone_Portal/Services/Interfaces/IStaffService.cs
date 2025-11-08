using SportZone_API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportZone_API.Models;

namespace SportZone_API.Services.Interfaces
{
    public interface IStaffService
    {
        Task<ServiceResponse<IEnumerable<StaffDto>>> GetAllStaffAsync();
        Task<ServiceResponse<IEnumerable<StaffDto>>> GetStaffByFacilityIdAsync(int facilityId);
        Task<ServiceResponse<StaffDto>> GetStaffByUIdAsync(int uId);
        Task<ServiceResponse<string>> UpdateStaffAsync(int uId, UpdateStaffDto dto);
        Task<ServiceResponse<string>> DeleteStaffAsync(int uId);
        Task<ServiceResponse<List<Staff>>> GetStaffByFieldOwnerIdAsync(int fieldOwnerId);
    }
}