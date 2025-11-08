using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Linq;
using System.Collections.Generic; 

namespace SportZone_API.Repositories
{
    public class FacilityRepository : IFacilityRepository
    {
        private readonly SportZoneContext _context;

        public FacilityRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<List<Facility>> GetAllAsync(string? searchText = null)
        {
            var query = _context.Facilities.Include(f => f.Images).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                query = query.Where(f => (f.Name ?? "").Contains(searchText) ||
                                         (f.Address ?? "").Contains(searchText) ||
                                         (f.Description ?? "").Contains(searchText) ||
                                         (f.Subdescription ?? "").Contains(searchText));
            }

            return await query.ToListAsync();
        }

        public async Task<List<Facility>> GetAllWithDetailsAsync(string? searchText = null)
        {
            var query = _context.Facilities
                .Include(f => f.Images)
                .Include(f => f.Fields)
                    .ThenInclude(field => field.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                query = query.Where(f => (f.Name ?? "").Contains(searchText) ||
                                         (f.Address ?? "").Contains(searchText) ||
                                         (f.Description ?? "").Contains(searchText) ||
                                         (f.Subdescription ?? "").Contains(searchText));
            }

            return await query.ToListAsync();
        }

        public async Task<List<Facility>> GetFacilitiesByFilterAsync(string? categoryFieldName = null, string? address = null)
        {
            var query = _context.Facilities
                .Include(f => f.Images)
                .Include(f => f.Fields)
                    .ThenInclude(field => field.Category)
                .AsQueryable();

            // Lọc theo Category Field Name
            if (!string.IsNullOrWhiteSpace(categoryFieldName))
            {
                query = query.Where(f => f.Fields.Any(field => 
                    field.Category != null && 
                    field.Category.CategoryFieldName != null && 
                    field.Category.CategoryFieldName.Contains(categoryFieldName)));
            }

            // Lọc theo địa chỉ
            if (!string.IsNullOrWhiteSpace(address))
            {
                query = query.Where(f => f.Address != null && f.Address.Contains(address));
            }

            return await query.ToListAsync();
        }

        public async Task<Facility?> GetByIdAsync(int id)
        {
            return await _context.Facilities
                                 .Include(f => f.Images)
                                 .Include(f => f.Fields)
                                 .Include(f => f.Orders)
                                 .Include(f => f.Services)
                                 .Include(f => f.Staff)
                                 .FirstOrDefaultAsync(f => f.FacId == id);
        }

        public async Task AddAsync(Facility facility)
        {
            await _context.Facilities.AddAsync(facility);
        }

        public async Task UpdateAsync(Facility facility)
        {
            var existingFacility = await _context.Facilities
                                                 .Include(f => f.Images)
                                                 .AsNoTracking()
                                                 .FirstOrDefaultAsync(f => f.FacId == facility.FacId);

            if (existingFacility != null)
            {
                foreach (var existingImage in existingFacility.Images)
                {
                    if (!facility.Images.Any(i => i.ImgId == existingImage.ImgId))
                    {
                        _context.Images.Remove(existingImage);
                    }
                }

                foreach (var newImage in facility.Images)
                {
                    if (newImage.ImgId == 0)
                    {
                        _context.Images.Add(newImage);
                    }
                    else
                    {
                        var entry = _context.Entry(newImage);
                        if (entry.State == EntityState.Detached)
                        {
                            _context.Images.Attach(newImage);
                            entry.State = EntityState.Modified;
                        }
                    }
                }
                _context.Entry(facility).State = EntityState.Modified;
            }
        }

        public async Task DeleteAsync(Facility facility)
        {
            _context.Facilities.Remove(facility);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<Facility>> GetByUserIdAsync(int userId)
        {
            return await _context.Facilities
                                 .Include(f => f.Images)
                                 .Where(f => f.UId == userId)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<CategoryField>> GetCategoryFieldsByFacilityIdAsync(int facilityId)
        {
            return await _context.Fields
                                 .Where(f => f.FacId == facilityId && f.Category != null)
                                 .Select(f => f.Category!)
                                 .Distinct()
                                 .ToListAsync();
        }

        public async Task AddImagesAsync(IEnumerable<Image> images)
        {
            await _context.Images.AddRangeAsync(images);
        }

        public void DetachEntity<T>(T entity) where T : class
        {
            _context.Entry(entity).State = EntityState.Detached;
        }

        public async Task<List<Image>> GetImagesByFacilityIdAsync(int facilityId)
        {
            return await _context.Images.Where(img => img.FacId == facilityId).ToListAsync();
        }

        public async Task RemoveImagesAsync(IEnumerable<Image> images)
        {
            _context.Images.RemoveRange(images);
        }
    }
}