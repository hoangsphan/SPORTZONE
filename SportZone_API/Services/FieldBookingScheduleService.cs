using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.Hubs;
using Microsoft.AspNetCore.Http; 

namespace SportZone_API.Services
{
    public class FieldBookingScheduleService : IFieldBookingScheduleService
    {
        private readonly IFieldBookingScheduleRepository _scheduleRepository;
        private readonly IFieldPricingService _fieldPricingService;
        private readonly IFieldRepository _fieldRepository;
        private readonly IFacilityRepository _facilityRepository;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IHttpContextAccessor _httpContextAccessor; 
        private static readonly TimeSpan FixedSlotDuration = TimeSpan.FromMinutes(30);

        public FieldBookingScheduleService(
            IFieldBookingScheduleRepository scheduleRepository,
            IFieldPricingService fieldPricingService,
            IFieldRepository fieldRepository,
            IFacilityRepository facilityRepository,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _scheduleRepository = scheduleRepository;
            _fieldPricingService = fieldPricingService;
            _fieldRepository = fieldRepository;
            _facilityRepository = facilityRepository;
            _mapper = mapper;
            _hubContext = hubContext;
            _httpContextAccessor = httpContextAccessor; // Khởi tạo HttpContextAccessor
        }

        // Lấy UserId từ HttpContext
        private string? GetCurrentUserId()
        {
            // Lấy HttpContext
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return null;
            }

            // Lấy User Id từ Claims của HttpContext
            // Giả sử UserId được lưu trong claim "sub" (standard) hoặc ClaimTypes.NameIdentifier
            var userId = httpContext.User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            return userId;
        }

        public async Task<IEnumerable<FieldBookingScheduleDto>> GetAllFieldBookingSchedulesAsync()
        {
            var schedules = await _scheduleRepository.GetAllSchedulesAsync();
            return _mapper.Map<IEnumerable<FieldBookingScheduleDto>>(schedules);
        }

        public async Task<FieldBookingScheduleDto?> GetFieldBookingScheduleByIdAsync(int id)
        {
            var schedule = await _scheduleRepository.GetScheduleByIdAsync(id);
            return _mapper.Map<FieldBookingScheduleDto>(schedule);
        }

        public async Task<ScheduleGenerationResponseDto> GenerateFieldBookingSchedulesAsync(FieldBookingScheduleGenerateDto generateDto)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
            if (generateDto.StartDate < today)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Ngày bắt đầu không được ở trong quá khứ."
                };
            }
            if (generateDto.StartDate > generateDto.EndDate)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc."
                };
            }

            var field = await _fieldRepository.GetFieldByIdAsync(generateDto.FieldId);
            if (field == null)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không tìm thấy sân."
                };
            }

            var facility = await _facilityRepository.GetByIdAsync(field.FacId.Value);
            if (facility == null)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không tìm thấy cơ sở."
                };
            }

            TimeOnly dailyStartTime = generateDto.DailyStartTime;
            TimeOnly dailyEndTime = generateDto.DailyEndTime;

            if (dailyStartTime < facility.OpenTime.Value)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = $"Thời gian bắt đầu trong ngày ({dailyStartTime.ToString(@"HH\:mm")}) không được nhỏ hơn thời gian mở cửa của cơ sở ({facility.OpenTime.Value.ToString(@"HH\:mm")})."
                };
            }

            if (dailyEndTime > facility.CloseTime.Value)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = $"Thời gian kết thúc trong ngày ({dailyEndTime.ToString(@"HH\:mm")}) không được lớn hơn thời gian đóng cửa của cơ sở ({facility.CloseTime.Value.ToString(@"HH\:mm")})."
                };
            }

            if (dailyStartTime >= dailyEndTime)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Thời gian bắt đầu trong ngày phải nhỏ hơn thời gian kết thúc trong ngày."
                };
            }

            var schedulesToAdd = new List<FieldBookingSchedule>();
            var pricingConfigsForField = (await _fieldPricingService.GetFieldPricingsByFieldIdAsync(generateDto.FieldId)).ToList();

            var existingSchedules = (await _scheduleRepository.GetAllSchedulesAsync())
                                         .Where(s => s.FieldId == generateDto.FieldId &&
                                                     s.Date >= generateDto.StartDate &&
                                                     s.Date <= generateDto.EndDate)
                                         .ToList();

            var duplicateEntriesFound = new List<string>();
            var duplicateDates = new HashSet<DateOnly>();

            DateOnly currentDate = generateDto.StartDate;
            while (currentDate <= generateDto.EndDate)
            {
                DateOnly todayLocal = DateOnly.FromDateTime(DateTime.Now);
                if (currentDate < todayLocal)
                {
                    currentDate = currentDate.AddDays(1);
                    continue;
                }

                TimeOnly slotStartTime = dailyStartTime;
                while (slotStartTime < dailyEndTime)
                {
                    TimeOnly slotEndTime = slotStartTime.Add(FixedSlotDuration);

                    if (slotEndTime > dailyEndTime)
                    {
                        if ((dailyEndTime - slotStartTime) < FixedSlotDuration)
                        {
                            break;
                        }
                        slotEndTime = dailyEndTime;
                    }

                    if (currentDate == todayLocal)
                    {
                        TimeOnly currentTime = TimeOnly.FromDateTime(DateTime.Now);
                        if (slotEndTime <= currentTime)
                        {
                            slotStartTime = slotEndTime;
                            continue;
                        }
                    }

                    bool scheduleExists = existingSchedules.Any(s =>
                        s.Date == currentDate &&
                        s.StartTime == slotStartTime &&
                        s.EndTime == slotEndTime &&
                        s.FieldId == generateDto.FieldId
                    );

                    if (!scheduleExists)
                    {
                        decimal slotPrice = CalculatePriceForSlot(slotStartTime, pricingConfigsForField);
                        schedulesToAdd.Add(new FieldBookingSchedule
                        {
                            FieldId = generateDto.FieldId,
                            Date = currentDate,
                            StartTime = slotStartTime,
                            EndTime = slotEndTime,
                            Price = slotPrice,
                            Status = "Available",
                            Notes = generateDto.Notes
                        });
                    }
                    else
                    {
                        duplicateEntriesFound.Add($"Slot {currentDate.ToShortDateString()} từ {slotStartTime.ToString(@"HH\:mm")} đến {slotEndTime.ToString(@"HH\:mm")}");
                        duplicateDates.Add(currentDate);
                    }
                    slotStartTime = slotEndTime;
                }
                currentDate = currentDate.AddDays(1);
            }

            if (duplicateEntriesFound.Any())
            {
                var duplicateDatesList = duplicateDates.OrderBy(d => d).ToList();
                string message;

                if (duplicateDatesList.Count == 1)
                {
                    message = $"Không thể tạo lịch. Ngày {duplicateDatesList[0].ToShortDateString()} đã có lịch đặt. Vui lòng kiểm tra lại.";
                }
                else if (duplicateDatesList.Count > 1)
                {
                    var dateRanges = new List<string>();
                    DateOnly rangeStart = duplicateDatesList[0];
                    DateOnly rangeEnd = duplicateDatesList[0];

                    for (int i = 1; i < duplicateDatesList.Count; i++)
                    {
                        if (duplicateDatesList[i] == rangeEnd.AddDays(1))
                        {
                            rangeEnd = duplicateDatesList[i];
                        }
                        else
                        {
                            if (rangeStart == rangeEnd)
                            {
                                dateRanges.Add(rangeStart.ToShortDateString());
                            }
                            else
                            {
                                dateRanges.Add($"{rangeStart.ToShortDateString()} đến {rangeEnd.ToShortDateString()}");
                            }
                            rangeStart = duplicateDatesList[i];
                            rangeEnd = duplicateDatesList[i];
                        }
                    }
                    if (rangeStart == rangeEnd)
                    {
                        dateRanges.Add(rangeStart.ToShortDateString());
                    }
                    else
                    {
                        dateRanges.Add($"{rangeStart.ToShortDateString()} đến {rangeEnd.ToShortDateString()}");
                    }
                    message = $"Không thể tạo lịch. Các ngày sau đã có lịch đặt: {string.Join("; ", dateRanges)}. Vui lòng kiểm tra lại.";
                }
                else
                {
                    message = "Đã xảy ra lỗi không xác định khi kiểm tra trùng lặp lịch.";
                }

                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = message
                };
            }

            if (!schedulesToAdd.Any())
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không có lịch hợp lệ nào được tạo ra. Vui lòng kiểm tra các tham số đầu vào và đảm bảo không có lịch nào đã ở trong quá khứ hoặc trùng lặp, hoặc không nằm trong giờ hoạt động của cơ sở."
                };
            }

            await _scheduleRepository.AddRangeSchedulesAsync(schedulesToAdd);

            // Lấy ID người dùng hiện tại
            var currentUserId = GetCurrentUserId();
            if (currentUserId != null)
            {
                // Gửi thông báo trực tiếp đến người dùng hiện tại
                await _hubContext.Clients.User(currentUserId).SendAsync("ReceiveNotification", $"Đã tạo thành công {schedulesToAdd.Count} lịch cho sân '{field.FieldName}' từ {generateDto.StartDate.ToShortDateString()} đến {generateDto.EndDate.ToShortDateString()}.");
            }

            return new ScheduleGenerationResponseDto
            {
                IsSuccess = true,
                Message = $"Đã tạo thành công {schedulesToAdd.Count} lịch cho sân {generateDto.FieldId} từ {generateDto.StartDate.ToShortDateString()} đến {generateDto.EndDate.ToShortDateString()}."
            };
        }

        private decimal CalculatePriceForSlot(TimeOnly slotCurrentTime, List<FieldPricingDto> pricingConfigs)
        {
            var matchedConfig = pricingConfigs
                .FirstOrDefault(pc =>
                    slotCurrentTime >= pc.StartTime &&
                    slotCurrentTime < pc.EndTime);
            if (matchedConfig != null)
            {
                return matchedConfig.Price;
            }
            return 0m;
        }

        public async Task<ScheduleGenerationResponseDto> UpdateGeneratedFieldBookingSchedulesAsync(FieldBookingScheduleUpdateGenerateDto updateDto)
        {
            // 1. Validate
            if (updateDto.StartDate > updateDto.EndDate)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc."
                };
            }

            var existingSchedules = (await _scheduleRepository.GetSchedulesByFieldAndDateRangeAsync(updateDto.FieldId, updateDto.StartDate, updateDto.EndDate)).ToList();

            if (!existingSchedules.Any())
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không tìm thấy lịch đặt sân nào để cập nhật trong khoảng thời gian đã chọn."
                };
            }

            var schedulesWithBooking = existingSchedules.Where(s => s.BookingId.HasValue).ToList();
            if (schedulesWithBooking.Any())
            {
                var bookingDates = schedulesWithBooking.Select(s => s.Date).Distinct().OrderBy(d => d).ToList();
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = $"Không thể cập nhật. Đã có booking trên các ngày: {string.Join(", ", bookingDates.Select(d => $"{d:dd/MM/yyyy}"))}."
                };
            }

            // Kiểm tra giờ hoạt động của cơ sở và các ràng buộc khác
            var field = await _fieldRepository.GetFieldByIdAsync(updateDto.FieldId);
            if (field == null)
            {
                return new ScheduleGenerationResponseDto { IsSuccess = false, Message = "Không tìm thấy sân." };
            }
            var facility = await _facilityRepository.GetByIdAsync(field.FacId.Value);
            if (facility == null)
            {
                return new ScheduleGenerationResponseDto { IsSuccess = false, Message = "Không tìm thấy cơ sở." };
            }
            if (updateDto.DailyStartTime < facility.OpenTime.Value)
            {
                return new ScheduleGenerationResponseDto { IsSuccess = false, Message = $"Thời gian bắt đầu trong ngày ({updateDto.DailyStartTime.ToString(@"HH\:mm")}) không được nhỏ hơn thời gian mở cửa của cơ sở ({facility.OpenTime.Value.ToString(@"HH\:mm")})." };
            }
            if (updateDto.DailyEndTime > facility.CloseTime.Value)
            {
                return new ScheduleGenerationResponseDto { IsSuccess = false, Message = $"Thời gian kết thúc trong ngày ({updateDto.DailyEndTime.ToString(@"HH\:mm")}) không được lớn hơn thời gian đóng cửa của cơ sở ({facility.CloseTime.Value.ToString(@"HH\:mm")})." };
            }
            if (updateDto.DailyStartTime >= updateDto.DailyEndTime)
            {
                return new ScheduleGenerationResponseDto { IsSuccess = false, Message = "Thời gian bắt đầu trong ngày phải nhỏ hơn thời gian kết thúc trong ngày." };
            }

            // 2. Xóa các lịch hiện có (không có booking)
            await _scheduleRepository.DeleteRangeSchedulesAsync(existingSchedules);

            // 3. Tạo lại các lịch mới với thời gian cập nhật
            var generateDto = new FieldBookingScheduleGenerateDto
            {
                FieldId = updateDto.FieldId,
                StartDate = updateDto.StartDate,
                EndDate = updateDto.EndDate,
                DailyStartTime = updateDto.DailyStartTime,
                DailyEndTime = updateDto.DailyEndTime,
                Notes = updateDto.Notes
            };

            var generateResponse = await GenerateFieldBookingSchedulesAsync(generateDto);

            if (!generateResponse.IsSuccess)
            {
                // Có lỗi xảy ra trong quá trình tạo lại lịch.
                return generateResponse;
            }

            // 4. Gửi thông báo
            var currentUserId = GetCurrentUserId();
            if (currentUserId != null && field != null)
            {
                await _hubContext.Clients.User(currentUserId).SendAsync(
                    "ReceiveNotification",
                    $"Đã cập nhật thành công lịch cho sân '{field.FieldName}' từ {updateDto.StartDate:dd/MM/yyyy} đến {updateDto.EndDate:dd/MM/yyyy}."
                );
            }

            return new ScheduleGenerationResponseDto
            {
                IsSuccess = true,
                Message = $"Đã cập nhật thành công lịch đặt sân."
            };
        }

        public async Task<ScheduleGenerationResponseDto> DeleteGeneratedFieldBookingSchedulesAsync(FieldBookingScheduleDeleteGenerateDto deleteDto)
        {
            // 1. Validate
            if (deleteDto.StartDate > deleteDto.EndDate)
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc."
                };
            }

            var schedulesToDelete = (await _scheduleRepository.GetAllSchedulesAsync())
                .Where(s => s.FieldId == deleteDto.FieldId &&
                            s.Date >= deleteDto.StartDate &&
                            s.Date <= deleteDto.EndDate)
                .ToList();

            if (!schedulesToDelete.Any())
            {
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = "Không tìm thấy lịch đặt sân nào để xóa trong khoảng thời gian đã chọn."
                };
            }

            var schedulesWithBooking = schedulesToDelete.Where(s => s.BookingId.HasValue).ToList();
            if (schedulesWithBooking.Any())
            {
                var bookingDates = schedulesWithBooking.Select(s => s.Date).Distinct().OrderBy(d => d).ToList();
                return new ScheduleGenerationResponseDto
                {
                    IsSuccess = false,
                    Message = $"Không thể xóa. Đã có booking trên các ngày: {string.Join(", ", bookingDates.Select(d => $"{d:dd/MM/yyyy}"))}."
                };
            }

            // 2. Xóa các lịch
            await _scheduleRepository.DeleteRangeSchedulesAsync(schedulesToDelete); // Giả sử có method này

            // 3. Gửi thông báo
            var currentUserId = GetCurrentUserId();
            if (currentUserId != null)
            {
                var field = await _fieldRepository.GetFieldByIdAsync(deleteDto.FieldId);
                await _hubContext.Clients.User(currentUserId).SendAsync(
                    "ReceiveNotification",
                    $"Đã xóa thành công {schedulesToDelete.Count} lịch cho sân '{field?.FieldName}' từ {deleteDto.StartDate:dd/MM/yyyy} đến {deleteDto.EndDate:dd/MM/yyyy}."
                );
            }

            return new ScheduleGenerationResponseDto
            {
                IsSuccess = true,
                Message = $"Đã xóa thành công {schedulesToDelete.Count} lịch đặt sân."
            };
        }

        public async Task<ServiceResponse<FieldBookingScheduleByDateDto>> GetSchedulesByFacilityAndDateAsync(int facilityId, DateOnly date)
        {
            var response = new ServiceResponse<FieldBookingScheduleByDateDto>();
            try
            {
                var result = await _scheduleRepository.GetSchedulesByFacilityAndDateAsync(facilityId, date);
                response.Data = result;
                response.Success = true;
                response.Message = $"Lấy lịch đặt sân thành công cho facility {result.FacilityName} ngày {date:dd/MM/yyyy}";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }
    }
}