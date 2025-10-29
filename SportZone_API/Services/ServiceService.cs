using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.DTOs;
using SportZone_API.Helpers;
using SportZone_API.Hubs;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Repository.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Runtime.InteropServices;

namespace SportZone_API.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ServiceService(IServiceRepository serviceRepository, IMapper mapper, IWebHostEnvironment env, IHubContext<NotificationHub> hubContext)
        {
            _serviceRepository = serviceRepository;
            _mapper = mapper;
            _env = env;
            _hubContext = hubContext;
        }

        public async Task<IEnumerable<ServiceDTO>> GetAllServicesAsync()
        {
            var services = await _serviceRepository.GetAllServicesAsync();
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        public async Task<ServiceResponseDTO?> GetServiceByIdAsync(int serviceId)
        {
            var service = await _serviceRepository.GetServiceByIdAsync(serviceId);
            if (service == null)
            {
                return null;
            }
            return _mapper.Map<ServiceResponseDTO>(service);
        }

        public async Task<IEnumerable<ServiceDTO>> GetServicesByFacilityIdAsync(int facilityId)
        {
            var services = await _serviceRepository.GetServicesByFacilityIdAsync(facilityId);
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        public async Task<IEnumerable<ServiceDTO>> GetServicesByStatusAsync(string status)
        {
            if (!IsValidStatus(status))
                throw new ArgumentException("Status phải là 'Active' hoặc 'Inactive'");

            var services = await _serviceRepository.GetServicesByStatusAsync(status);
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        private static bool IsValidStatus(string? status)
        {
            return status == "Active" || status == "Inactive";
        }

        public async Task<ServiceResponseDTO> CreateServiceAsync(CreateServiceDTO createServiceDto)
        {
            if (!await _serviceRepository.FacilityExistsAsync(createServiceDto.FacId))
                throw new ArgumentException("Facility không tồn tại");

            ValidateServiceData(createServiceDto.ServiceName, createServiceDto.Price, createServiceDto.Status);

            var service = _mapper.Map<Service>(createServiceDto);

            if (createServiceDto.ImageFile != null)
            {
                const string subFolderName = "ServiceImages";
                var (isValid, errorMessage) = ImageUpload.ValidateImage(createServiceDto.ImageFile);
                if (!isValid)
                {
                    throw new ArgumentException(errorMessage);
                }
                var imageUrl = await ImageUpload.SaveImageAsync(createServiceDto.ImageFile, _env.WebRootPath, subFolderName);
                if (imageUrl == null)
                {
                    throw new InvalidOperationException("Lỗi khi lưu file ảnh.");
                }
                service.Image = imageUrl;
            }

            try
            {
                var createdService = await _serviceRepository.CreateServiceAsync(service);
                var createdServiceDTO = _mapper.Map<ServiceResponseDTO>(createdService);

                // Gửi thông báo đến người quản lý cơ sở và cập nhật UI real-time
                var message = $"Dịch vụ mới '{createdService.ServiceName}' với giá {createdService.Price:N0} VNĐ đã được thêm vào cơ sở của bạn. Trạng thái: {createdService.Status}.";
                await _hubContext.Clients.Group($"facility-{createdService.FacId}").SendAsync("ReceiveNotification", message);
                await _hubContext.Clients.Group($"facility-{createdService.FacId}").SendAsync("ServiceCreated", createdServiceDTO);

                return createdServiceDTO;
            }
            catch (Exception ex)
            {
                if (!string.IsNullOrEmpty(service.Image))
                {
                    ImageUpload.DeleteImage(service.Image, _env.WebRootPath);
                }
                throw new InvalidOperationException($"Lỗi khi tạo dịch vụ: {ex.Message}", ex);
            }
        }

        public async Task<ServiceResponseDTO?> UpdateServiceAsync(int serviceId, UpdateServiceDTO updateServiceDTO)
        {
            var existingService = await _serviceRepository.GetServiceByIdAsync(serviceId);
            if (existingService == null)
                return null;

            if (updateServiceDTO.FacId.HasValue && !await _serviceRepository.FacilityExistsAsync(updateServiceDTO.FacId.Value))
            {
                throw new ArgumentException("Facility không tồn tại");
            }

            if (updateServiceDTO.ImageFile != null)
            {
                const string subFolderName = "ServiceImages";
                var (isValid, errorMessage) = ImageUpload.ValidateImage(updateServiceDTO.ImageFile);
                if (!isValid)
                {
                    throw new ArgumentException(errorMessage);
                }

                var newImageUrl = await ImageUpload.SaveImageAsync(updateServiceDTO.ImageFile, _env.WebRootPath, subFolderName);
                if (newImageUrl == null)
                {
                    throw new InvalidOperationException("Lỗi khi lưu file ảnh mới.");
                }

                if (!string.IsNullOrEmpty(existingService.Image))
                {
                    ImageUpload.DeleteImage(existingService.Image, _env.WebRootPath);
                }
                existingService.Image = newImageUrl;
            }
            else if (updateServiceDTO.RemoveImage && updateServiceDTO.ImageFile == null)
            {
                if (!string.IsNullOrEmpty(existingService.Image))
                {
                    ImageUpload.DeleteImage(existingService.Image, _env.WebRootPath);
                    existingService.Image = null; 
                }
            }

            ValidateServiceData(
                updateServiceDTO.ServiceName ?? existingService.ServiceName,
                updateServiceDTO.Price ?? existingService.Price ?? 0,
                updateServiceDTO.Status ?? existingService.Status
            );

            _mapper.Map(updateServiceDTO, existingService);

            try
            {
                var updatedService = await _serviceRepository.UpdateServiceAsync(existingService);
                var updatedServiceDTO = _mapper.Map<ServiceResponseDTO>(updatedService);
                var updatedFields = new List<string>();
                if (updateServiceDTO.ServiceName != null && updateServiceDTO.ServiceName != updatedService.ServiceName)
                {
                    updatedFields.Add($"Tên dịch vụ đã đổi thành '{updatedService.ServiceName}'");
                }
                if (updateServiceDTO.Price.HasValue && updateServiceDTO.Price.Value != existingService.Price)
                {
                    updatedFields.Add($"Giá đã đổi từ {existingService.Price:N0} VNĐ thành {updatedService.Price:N0} VNĐ");
                }
                if (updateServiceDTO.Status != null && updateServiceDTO.Status != existingService.Status)
                {
                    updatedFields.Add($"Trạng thái đã đổi từ '{existingService.Status}' thành '{updatedService.Status}'");
                }
                string message;
                if (updatedFields.Any())
                {
                    message = $"Dịch vụ '{updatedService.ServiceName}' đã được cập nhật. Cụ thể: {string.Join(", ", updatedFields)}.";
                }
                else
                {
                    message = $"Thông tin của dịch vụ '{updatedService.ServiceName}' đã được cập nhật.";
                }
                await _hubContext.Clients.Group($"facility-{updatedService.FacId}").SendAsync("ReceiveNotification", message);
                await _hubContext.Clients.Group($"facility-{updatedService.FacId}").SendAsync("ServiceUpdated", updatedServiceDTO);
                return updatedServiceDTO;
            }
            catch (Exception ex)
            {
                if (updateServiceDTO.ImageFile != null)
                {
                    ImageUpload.DeleteImage(existingService.Image!, _env.WebRootPath);
                }
                throw new InvalidOperationException($"Lỗi khi cập nhật dịch vụ: {ex.Message}", ex);
            }
        }

        private static void ValidateServiceData(string? serviceName, decimal price, string? status)
        {
            if (string.IsNullOrWhiteSpace(serviceName))
                throw new ArgumentException("Tên dịch vụ không được để trống");

            if (price < 0)
                throw new ArgumentException("Giá dịch vụ phải lớn hơn hoặc bằng 0");

            if (!IsValidStatus(status))
                throw new ArgumentException("Status phải là 'Active' hoặc 'Inactive'");
        }

        public async Task<bool> DeleteServiceAsync(int serviceId)
        {
            var service = await _serviceRepository.GetServiceByIdAsync(serviceId);
            if (service == null)
            {
                return false;
            }
            if (service.OrderServices.Any())
            {
                throw new InvalidOperationException("Không thể xóa dịch vụ vì đã có đơn hàng liên quan");
            }

            var facId = service.FacId;
            var serviceName = service.ServiceName;

            if (!string.IsNullOrEmpty(service.Image))
            {
                ImageUpload.DeleteImage(service.Image, _env.WebRootPath);
            }

            var isDeleted = await _serviceRepository.DeleteServiceAsync(serviceId);

            if (isDeleted)
            {
                var message = $"Dịch vụ '{serviceName}' (ID: {serviceId}) đã bị xóa khỏi hệ thống.";
                await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ReceiveNotification", message);
                await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ServiceDeleted", serviceId);
            }

            return isDeleted;
        }

        public async Task<bool> ServiceExistsByIdAsync(int serviceId)
        {
            return await _serviceRepository.ServiceExistsByIdAsync(serviceId);
        }

        public async Task<int> GetTotalServicesCountAsync()
        {
            return await _serviceRepository.GetTotalServicesCountAsync();
        }

        public async Task<(IEnumerable<ServiceDTO> Services, int TotalCount)> GetServicesWithPaginationAsync(int pageNumber, int pageSize)
        {
            if (pageNumber <= 0 || pageSize <= 0)
                throw new ArgumentException("Page number và page size phải lớn hơn 0");

            var services = await _serviceRepository.GetServicesWithPaginationAsync(pageNumber, pageSize);
            var totalCount = await _serviceRepository.GetTotalServicesCountAsync();

            var servicesDtos = _mapper.Map<IEnumerable<ServiceDTO>>(services);

            return (servicesDtos, totalCount);
        }
    }
}