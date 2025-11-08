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

namespace SportZone_API.Services
{
    public class FieldPricingService : IFieldPricingService
    {
        private readonly IFieldPricingRepository _fieldPricingRepository;
        private readonly IFieldBookingScheduleRepository _fieldBookingScheduleRepository;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public FieldPricingService(
            IFieldPricingRepository fieldPricingRepository,
            IFieldBookingScheduleRepository fieldBookingScheduleRepository,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext) 
        {
            _fieldPricingRepository = fieldPricingRepository;
            _fieldBookingScheduleRepository = fieldBookingScheduleRepository;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<IEnumerable<FieldPricingDto>> GetAllFieldPricingsAsync()
        {
            var pricings = await _fieldPricingRepository.GetAllPricingConfigsAsync();
            return _mapper.Map<IEnumerable<FieldPricingDto>>(pricings);
        }

        public async Task<FieldPricingDto?> GetFieldPricingByIdAsync(int id)
        {
            var pricing = await _fieldPricingRepository.GetPricingConfigByIdAsync(id);
            return _mapper.Map<FieldPricingDto>(pricing);
        }

        public async Task<IEnumerable<FieldPricingDto>> GetFieldPricingsByFieldIdAsync(int fieldId)
        {
            var pricings = await _fieldPricingRepository.GetPricingConfigsByFieldIdAsync(fieldId);
            return _mapper.Map<IEnumerable<FieldPricingDto>>(pricings);
        }

        public async Task<FieldPricingDto> CreateFieldPricingAsync(FieldPricingCreateDto createDto)
        {
            var pricing = _mapper.Map<FieldPricing>(createDto);
            await _fieldPricingRepository.AddPricingConfigAsync(pricing);

            // Cập nhật giá lịch và gửi thông báo
            await UpdateFieldBookingSchedulesPrice(createDto.FieldId);

            return _mapper.Map<FieldPricingDto>(pricing);
        }

        public async Task<FieldPricingDto?> UpdateFieldPricingAsync(int id, FieldPricingUpdateDto updateDto)
        {
            var existingPricing = await _fieldPricingRepository.GetPricingConfigByIdAsync(id);
            if (existingPricing == null)
            {
                return null;
            }
            _mapper.Map(updateDto, existingPricing);
            await _fieldPricingRepository.UpdatePricingConfigAsync(existingPricing);

            // Cập nhật giá lịch và gửi thông báo
            await UpdateFieldBookingSchedulesPrice(existingPricing.FieldId);

            return _mapper.Map<FieldPricingDto>(existingPricing);
        }

        public async Task<bool> DeleteFieldPricingAsync(int id)
        {
            var configToDelete = await _fieldPricingRepository.GetPricingConfigByIdAsync(id);
            if (configToDelete == null)
            {
                return false;
            }
            var result = await _fieldPricingRepository.DeletePricingConfigAsync(id);
            if (result)
            {
                // Cập nhật giá lịch và gửi thông báo
                await UpdateFieldBookingSchedulesPrice(configToDelete.FieldId);
            }
            return result;
        }

        private async Task UpdateFieldBookingSchedulesPrice(int fieldId)
        {
            var allPricingConfigsForField = (await _fieldPricingRepository.GetPricingConfigsByFieldIdAsync(fieldId)).ToList();
            var schedulesToUpdate = await _fieldBookingScheduleRepository.GetSchedulesByFieldIdAsync(fieldId);
            var updatedSchedules = new List<FieldBookingSchedule>();

            foreach (var schedule in schedulesToUpdate)
            {
                if (schedule.StartTime.HasValue)
                {
                    decimal newPrice = CalculatePriceForSlot(schedule.StartTime.Value, allPricingConfigsForField);
                    if (schedule.Price != newPrice)
                    {
                        schedule.Price = newPrice;
                        updatedSchedules.Add(schedule);
                    }
                }
            }

            if (updatedSchedules.Any())
            {
                await _fieldBookingScheduleRepository.UpdateRangeSchedulesAsync(updatedSchedules);

                // Gửi thông báo SignalR tới group của sân
                await _hubContext.Clients.Group($"field-{fieldId}").SendAsync(
                    "Cập nhật giá thành công",
                    _mapper.Map<IEnumerable<FieldBookingScheduleDto>>(updatedSchedules)
                );
            }
        }

        private decimal CalculatePriceForSlot(TimeOnly slotCurrentTime, List<FieldPricing> pricingConfigs)
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
    }
}