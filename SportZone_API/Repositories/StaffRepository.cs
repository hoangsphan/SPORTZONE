using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly SportZoneContext _context;

        public StaffRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Staff>> GetStaffByFacilityIdAsync(int facilityId)
        {
            return await _context.Staff
                                 .Where(s => s.FacId == facilityId)
                                 .Include(s => s.UIdNavigation)
                                     .ThenInclude(u => u.Role)
                                 .Include(s => s.Fac)
                                 .ToListAsync();
        }

        public async Task UpdateStaffAsync(Staff staff)
        {
            _context.Staff.Update(staff);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteStaffAsync(Staff staff)
        {
            _context.Staff.Remove(staff);
            await _context.SaveChangesAsync();
        }

        public async Task<Staff?> GetByUIdAsync(int uId)
        {
            return await _context.Staff
                                 .Where(s => s.UId == uId)
                                 .Include(s => s.UIdNavigation)
                                 .Include(s => s.Fac)
                                 .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Staff>> GetAllStaffAsync()
        {
            return await _context.Staff
                                 .Include(s => s.UIdNavigation)
                                     .ThenInclude(u => u.Role)
                                 .Include(s => s.Fac)
                                 .ToListAsync();
        }
        public async Task<List<Staff>> GetStaffByFieldOwnerIdAsync(int fieldOwnerId)
        {
            try
            {             
                var staff = await _context.Staff
                    .Include(s => s.Fac) 
                    .Include(s => s.UIdNavigation) 
                    .Where(s => s.Fac != null && s.Fac.UId == fieldOwnerId)
                    .ToListAsync();

                return staff;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách staff của field owner: {ex.Message}", ex);
            }
        }
    }
}