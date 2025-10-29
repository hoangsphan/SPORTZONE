//using Microsoft.EntityFrameworkCore;
//using SportZone_API.DTOs;
//using SportZone_API.Models;
//using SportZone_API.Repositories.Interfaces;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using System;
//using SportZone_API.DTOs;

//namespace SportZone_API.Repositories
//{
//    public class FieldBookingScheduleRepository : IFieldBookingScheduleRepository
//    {
//        private readonly SportZoneContext _context;

//        public FieldBookingScheduleRepository(SportZoneContext context)
//        {
//            _context = context;
//        }

//        public async Task<IEnumerable<FieldBookingSchedule>> GetAllSchedulesAsync()
//        {
//            return await _context.FieldBookingSchedules.ToListAsync();
//        }

//        public async Task<FieldBookingSchedule?> GetScheduleByIdAsync(int id)
//        {
//            return await _context.FieldBookingSchedules.FindAsync(id);
//        }

//        public async Task AddRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules)
//        {
//            await _context.FieldBookingSchedules.AddRangeAsync(schedules);
//            await _context.SaveChangesAsync();
//        }

//        public async Task UpdateScheduleAsync(FieldBookingSchedule schedule)
//        {
//            _context.FieldBookingSchedules.Update(schedule);
//            await _context.SaveChangesAsync();
//        }

//        public async Task<bool> DeleteScheduleAsync(int id)
//        {
//            var schedule = await _context.FieldBookingSchedules.FindAsync(id);
//            if (schedule == null)
//            {
//                return false;
//            }
//            _context.FieldBookingSchedules.Remove(schedule);
//            await _context.SaveChangesAsync();
//            return true;
//        }

//        public async Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldAndDateRangeAsync(int fieldId, DateOnly startDate, DateOnly endDate)
//        {
//            return await _context.FieldBookingSchedules
//                                 .Where(s => s.FieldId == fieldId && s.Date >= startDate && s.Date <= endDate)
//                                 .ToListAsync();
//        }


//        public async Task<FieldBookingScheduleByDateDto> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date)
//        {
//            try
//            {

//                var facility = await _context.Facilities
//                    .Where(f => f.FacId == facilityId)
//                    .FirstOrDefaultAsync();

//                if (facility == null)
//                {
//                    throw new Exception($"Không tìm thấy facility với ID: {facilityId}");
//                }

//                // Lấy tất cả fields của facility này
//                var fields = await _context.Fields
//                    .Include(f => f.Category) // Include category
//                    .Include(f => f.FieldBookingSchedules.Where(s => s.Date == date)) // Include schedules cho ngày cụ thể
//                    .ThenInclude(s => s.Booking) // Include booking info
//                    .Where(f => f.FacId == facilityId)
//                    .ToListAsync();

//                // Tạo response DTO
//                var result = new FieldBookingScheduleByDateDto
//                {
//                    FacilityId = facilityId,
//                    FacilityName = facility.Name ?? "",
//                    Date = date,
//                    Fields = fields.Select(field => new FieldWithSchedulesDto
//                    {
//                        FieldId = field.FieldId,
//                        FieldName = field.FieldName ?? "",
//                        Description = field.Description,
//                        IsBookingEnable = field.IsBookingEnable,
//                        Category = field.Category != null ? new CategoryFieldDto
//                        {
//                            CategoryFieldId = field.Category.CategoryFieldId,
//                            CategoryFieldName = field.Category.CategoryFieldName ?? ""
//                        } : null,
//                        Schedules = field.FieldBookingSchedules.Select(schedule => new ScheduleDto
//                        {
//                            ScheduleId = schedule.ScheduleId,
//                            BookingId = schedule.BookingId,
//                            StartTime = schedule.StartTime,
//                            EndTime = schedule.EndTime,
//                            Notes = schedule.Notes,
//                            Status = schedule.Status,
//                            Price = schedule.Price,
//                            Booking = schedule.Booking != null ? new BookingDto
//                            {
//                                BookingId = schedule.Booking.BookingId,
//                                Title = schedule.Booking.Title,
//                                GuestName = schedule.Booking.GuestName,
//                                GuestPhone = schedule.Booking.GuestPhone,
//                                Status = schedule.Booking.Status,
//                                StatusPayment = schedule.Booking.StatusPayment
//                            } : null
//                        }).ToList()
//                    }).ToList()
//                };

//                return result;
//            }
//            catch (Exception ex)
//            {
//                throw new Exception($"Lỗi khi lấy lịch đặt sân theo facility và ngày: {ex.Message}", ex);
//            }
//        }

//        public async Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldIdAsync(int fieldId)
//        {
//            return await _context.FieldBookingSchedules
//                                 .Where(s => s.FieldId == fieldId)
//                                 .ToListAsync();
//        }

//        public async Task UpdateRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules)
//        {
//            _context.FieldBookingSchedules.UpdateRange(schedules);
//            await _context.SaveChangesAsync();

//        }


//    }
//}
using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using SportZone_API.DTOs;

namespace SportZone_API.Repositories
{
    public class FieldBookingScheduleRepository : IFieldBookingScheduleRepository
    {
        private readonly SportZoneContext _context;

        public FieldBookingScheduleRepository(SportZoneContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FieldBookingSchedule>> GetAllSchedulesAsync()
        {
            return await _context.FieldBookingSchedules.ToListAsync();
        }

        public async Task<FieldBookingSchedule?> GetScheduleByIdAsync(int id)
        {
            return await _context.FieldBookingSchedules.FindAsync(id);
        }

        public async Task AddRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules)
        {
            await _context.FieldBookingSchedules.AddRangeAsync(schedules);
            await _context.SaveChangesAsync();
        }

        //public async Task UpdateScheduleAsync(FieldBookingSchedule schedule)
        //{
        //    _context.FieldBookingSchedules.Update(schedule);
        //    await _context.SaveChangesAsync();
        //}

        //public async Task<bool> DeleteScheduleAsync(int id)
        //{
        //    var schedule = await _context.FieldBookingSchedules.FindAsync(id);
        //    if (schedule == null)
        //    {
        //        return false;
        //    }
        //    _context.FieldBookingSchedules.Remove(schedule);
        //    await _context.SaveChangesAsync();
        //    return true;
        //}

        public async Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldAndDateRangeAsync(int fieldId, DateOnly startDate, DateOnly endDate)
        {
            return await _context.FieldBookingSchedules
                                 .Where(s => s.FieldId == fieldId && s.Date >= startDate && s.Date <= endDate)
                                 .ToListAsync();
        }

        public async Task<FieldBookingScheduleByDateDto> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date)
        {
            try
            {
                var facility = await _context.Facilities
                    .Where(f => f.FacId == facilityId)
                    .FirstOrDefaultAsync();

                if (facility == null)
                {
                    throw new Exception($"Không tìm thấy facility với ID: {facilityId}");
                }

                // Lấy tất cả fields của facility này
                var fields = await _context.Fields
                    .Include(f => f.Category) // Include category
                    .Include(f => f.FieldBookingSchedules.Where(s => s.Date == date)) // Include schedules cho ngày cụ thể
                    .ThenInclude(s => s.Booking) // Include booking info
                    .Where(f => f.FacId == facilityId)
                    .ToListAsync();

                // Tạo response DTO
                var result = new FieldBookingScheduleByDateDto
                {
                    FacilityId = facilityId,
                    FacilityName = facility.Name ?? "",
                    Date = date,
                    Fields = fields.Select(field => new FieldWithSchedulesDto
                    {
                        FieldId = field.FieldId,
                        FieldName = field.FieldName ?? "",
                        Description = field.Description,
                        IsBookingEnable = field.IsBookingEnable,
                        Category = field.Category != null ? new CategoryFieldDto
                        {
                            CategoryFieldId = field.Category.CategoryFieldId,
                            CategoryFieldName = field.Category.CategoryFieldName ?? ""
                        } : null,
                        Schedules = field.FieldBookingSchedules.Select(schedule => new ScheduleDto
                        {
                            ScheduleId = schedule.ScheduleId,
                            BookingId = schedule.BookingId,
                            StartTime = schedule.StartTime,
                            EndTime = schedule.EndTime,
                            Notes = schedule.Notes,
                            Status = schedule.Status,
                            Price = schedule.Price,
                            Booking = schedule.Booking != null ? new BookingDto
                            {
                                BookingId = schedule.Booking.BookingId,
                                Title = schedule.Booking.Title,
                                GuestName = schedule.Booking.GuestName,
                                GuestPhone = schedule.Booking.GuestPhone,
                                Status = schedule.Booking.Status,
                                StatusPayment = schedule.Booking.StatusPayment
                            } : null
                        }).ToList()
                    }).ToList()
                };

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy lịch đặt sân theo facility và ngày: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldBookingSchedule>> GetSchedulesByFieldIdAsync(int fieldId)
        {
            return await _context.FieldBookingSchedules
                                 .Where(s => s.FieldId == fieldId)
                                 .ToListAsync();
        }

        public async Task UpdateRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules)
        {
            _context.FieldBookingSchedules.UpdateRange(schedules);
            await _context.SaveChangesAsync();
        }

        // Triển khai phương thức mới
        public async Task DeleteRangeSchedulesAsync(IEnumerable<FieldBookingSchedule> schedules)
        {
            _context.FieldBookingSchedules.RemoveRange(schedules);
            await _context.SaveChangesAsync();
        }
    }
}