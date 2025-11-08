using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;

namespace SportZone_API.Repositories
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly SportZoneContext _context;
        public ServiceRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Service>> GetAllServicesAsync()
        {
            try
            {
                return await _context.Services
                    .Include(s => s.Fac)
                    .Include(s => s.OrderServices)
                    .OrderBy(s => s.ServiceName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving services.", ex);
            }
        }

        public async Task<Service?> GetServiceByIdAsync(int serviceId)
        {
            try
            {
                return await _context.Services
                    .Include(s => s.Fac)
                    .Include(s => s.OrderServices)
                    .FirstOrDefaultAsync(s => s.ServiceId == serviceId);

            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving service with ID {serviceId}.", ex);
            }
        }

        public async Task<IEnumerable<Service>> GetServicesByFacilityIdAsync(int facilityId)
        {
            try
            {
                return await _context.Services
                    .Include(s => s.Fac)
                    .Include(s => s.OrderServices)
                    .Where(s => s.FacId == facilityId)
                    .OrderBy(s => s.ServiceName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving services for facility ID {facilityId}.", ex);
            }
        }

        public async Task<IEnumerable<Service>> GetServicesByStatusAsync(string status)
        {
            try
            {
                return await _context.Services
                    .Include(s => s.Fac)
                    .Include(s => s.OrderServices)
                    .Where(s => s.Status == status)
                    .OrderBy(s => s.ServiceName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while retrieving services with status '{status}'.", ex);
            }
        }

        public async Task<Service> CreateServiceAsync(Service service)
        {
            try
            {
                _context.Services.Add(service);
                await _context.SaveChangesAsync();
                return await GetServiceByIdAsync(service.ServiceId) ?? service;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while creating the service.", ex);
            }
        }

        public async Task<Service> UpdateServiceAsync(Service service)
        {
            try
            {
                _context.Entry(service).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return await GetServiceByIdAsync(service.ServiceId) ?? service;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while updating the service with ID {service.ServiceId}.", ex);
            }
        }

        public async Task<bool> DeleteServiceAsync(int serviceId)
        {
            try
            {
                var service = await _context.Services.FindAsync(serviceId);
                if (service == null)
                {
                    return false;
                }
                service.Status = "Inactive";
                _context.Update(service);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred while deleting the service with ID {serviceId}.", ex);
            }
        }
        public async Task<bool> ServiceExistsByIdAsync(int serviceId)
        {
            return await _context.Services
                .AnyAsync(s => s.ServiceId == serviceId);
        }
        public async Task<bool> FacilityExistsAsync(int facilityId)
        {
            return await _context.Facilities
                .AnyAsync(f => f.FacId == facilityId);
        }

        public async Task<int> GetTotalServicesCountAsync()
        {
            return await _context.Services.CountAsync();
        }

        public async Task<IEnumerable<Service>> GetServicesWithPaginationAsync(int pageNumber, int pageSize)
        {
            return await _context.Services
                .Include(s => s.Fac)
                .Include(s => s.OrderServices)
                .OrderBy(s => s.ServiceName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
