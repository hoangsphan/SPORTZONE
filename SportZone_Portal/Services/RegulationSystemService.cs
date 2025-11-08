using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using SportZone_API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Services
{
    public class RegulationSystemService : IRegulationSystemService
    {
        private readonly IRegulationSystemRepository _repository;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public RegulationSystemService(
            IRegulationSystemRepository repository,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext)
        {
            _repository = repository;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<List<RegulationSystem>> GetAllRegulationSystems()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RegulationSystem?> GetRegulationSystemById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<ServiceResponse<RegulationSystem>> CreateRegulationSystem(RegulationSystemDto dto)
        {
            var regulationSystem = _mapper.Map<RegulationSystem>(dto);
            await _repository.AddAsync(regulationSystem);
            await _repository.SaveChangesAsync();

            var message = $"Quy định hệ thống mới '{regulationSystem.Title}' đã được tạo.";
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", message);
            await _hubContext.Clients.All.SendAsync("RegulationSystemCreated", regulationSystem);

            return new ServiceResponse<RegulationSystem>
            {
                Success = true,
                Message = "Tạo quy định hệ thống thành công.",
                Data = regulationSystem
            };
        }

        public async Task<ServiceResponse<RegulationSystem>> UpdateRegulationSystem(int id, RegulationSystemDto dto)
        {
            var regulationSystem = await _repository.GetByIdAsync(id);
            if (regulationSystem == null)
                return new ServiceResponse<RegulationSystem> { Success = false, Message = "Không tìm thấy quy định hệ thống." };

            _mapper.Map(dto, regulationSystem);
            await _repository.UpdateAsync(regulationSystem);
            await _repository.SaveChangesAsync();

            var message = $"Quy định hệ thống '{regulationSystem.Title}' đã được cập nhật.";
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", message);
            await _hubContext.Clients.All.SendAsync("RegulationSystemUpdated", regulationSystem);

            return new ServiceResponse<RegulationSystem>
            {
                Success = true,
                Message = "Cập nhật quy định hệ thống thành công.",
                Data = regulationSystem
            };
        }

        public async Task<ServiceResponse<RegulationSystem>> DeleteRegulationSystem(int id)
        {
            var regulationSystem = await _repository.GetByIdAsync(id);
            if (regulationSystem == null)
                return new ServiceResponse<RegulationSystem> { Success = false, Message = "Không tìm thấy quy định hệ thống." };

            var regulationName = regulationSystem.Title;
            await _repository.DeleteAsync(regulationSystem);
            await _repository.SaveChangesAsync();

            var message = $"Quy định hệ thống '{regulationName}' đã được xóa.";
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", message);
            await _hubContext.Clients.All.SendAsync("RegulationSystemDeleted", id);

            return new ServiceResponse<RegulationSystem>
            {
                Success = true,
                Message = "Xóa quy định hệ thống thành công.",
                Data = regulationSystem
            };
        }

        public async Task<List<RegulationSystem>> SearchRegulationSystems(string text)
        {
            return await _repository.SearchAsync(text);
        }
    }
}