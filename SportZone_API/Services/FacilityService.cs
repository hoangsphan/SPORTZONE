using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using SportZone_API.DTOs;
using SportZone_API.Helpers;
using SportZone_API.Models;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.SignalR; // Thêm using này
using SportZone_API.Hubs; // Thêm using này

namespace SportZone_API.Services
{
    public class FacilityService : IFacilityService
    {
        private readonly IFacilityRepository _repository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly IHubContext<NotificationHub> _hubContext; // Khai báo HubContext

        public FacilityService(
            IFacilityRepository repository,
            IMapper mapper,
            IWebHostEnvironment env,
            IHubContext<NotificationHub> hubContext) // Thêm vào constructor
        {
            _repository = repository;
            _mapper = mapper;
            _env = env;
            _hubContext = hubContext;
        }

        public async Task<ServiceResponse<List<FacilityDto>>> GetAllFacilities(string? searchText = null)
        {
            try
            {
                var facilities = await _repository.GetAllAsync(searchText);
                var facilityDtos = _mapper.Map<List<FacilityDto>>(facilities);

                if (facilityDtos == null || !facilityDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDto>>
                    {
                        Success = true,
                        Message = "Không tìm thấy cơ sở nào.",
                        Data = new List<FacilityDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách cơ sở thành công.",
                    Data = facilityDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<List<FacilityDetailDto>>> GetAllFacilitiesWithDetails(string? searchText = null)
        {
            try
            {
                var facilities = await _repository.GetAllWithDetailsAsync(searchText);
                var facilityDetailDtos = _mapper.Map<List<FacilityDetailDto>>(facilities);

                if (facilityDetailDtos == null || !facilityDetailDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDetailDto>>
                    {
                        Success = true,
                        Message = "Không tìm thấy cơ sở nào.",
                        Data = new List<FacilityDetailDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách cơ sở chi tiết thành công.",
                    Data = facilityDetailDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở chi tiết: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<List<FacilityDetailDto>>> GetFacilitiesByFilter(string? categoryFieldName = null, string? address = null)
        {
            try
            {
                var facilities = await _repository.GetFacilitiesByFilterAsync(categoryFieldName, address);
                var facilityDetailDtos = _mapper.Map<List<FacilityDetailDto>>(facilities);

                if (facilityDetailDtos == null || !facilityDetailDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDetailDto>>
                    {
                        Success = true,
                        Message = "Không tìm thấy cơ sở nào phù hợp với bộ lọc.",
                        Data = new List<FacilityDetailDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = true,
                    Message = "Lấy danh sách cơ sở theo bộ lọc thành công.",
                    Data = facilityDetailDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDetailDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở theo bộ lọc: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<FacilityDto?> GetFacilityById(int id)
        {
            var facility = await _repository.GetByIdAsync(id);
            return _mapper.Map<FacilityDto>(facility);
        }

        public async Task<ServiceResponse<FacilityDto>> CreateFacility(FacilityDto dto)
        {
            var imageUrls = new List<string>();
            var uploadedFilesPaths = new List<string>();
            const string subFolderName = "FacilityImages";

            if (dto.Images != null && dto.Images.Any())
            {
                foreach (var imageFile in dto.Images)
                {
                    var (isValid, errorMessage) = ImageUpload.ValidateImage(imageFile);
                    if (!isValid)
                    {
                        return new ServiceResponse<FacilityDto> { Success = false, Message = errorMessage };
                    }
                    var imageUrl = await ImageUpload.SaveImageAsync(imageFile, _env.WebRootPath, subFolderName);
                    if (imageUrl == null)
                    {
                        foreach (var path in uploadedFilesPaths)
                        {
                            System.IO.File.Delete(Path.Combine(_env.WebRootPath, path.TrimStart('/')));
                        }
                        return new ServiceResponse<FacilityDto> { Success = false, Message = "Lỗi khi lưu file ảnh." };
                    }
                    imageUrls.Add(imageUrl);
                    uploadedFilesPaths.Add(imageUrl);
                }
            }

            try
            {
                var facility = _mapper.Map<Facility>(dto);
                facility.Images = imageUrls.Select(url => new Image { ImageUrl = url }).ToList();

                await _repository.AddAsync(facility);
                await _repository.SaveChangesAsync();

                var createdFacility = await _repository.GetByIdAsync(facility.FacId);

                // Gửi thông báo tới Admin khi có cơ sở mới được tạo
                await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Cơ sở mới '{facility.Name}' đã được tạo.");

                return new ServiceResponse<FacilityDto>
                {
                    Success = true,
                    Message = "Tạo cơ sở thành công.",
                    Data = _mapper.Map<FacilityDto>(createdFacility)
                };
            }
            catch (Exception ex)
            {
                foreach (var url in uploadedFilesPaths)
                {
                    ImageUpload.DeleteImage(url, _env.WebRootPath);
                }

                return new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi tạo cơ sở: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<FacilityDto>> UpdateFacility(int id, FacilityUpdateDto dto)
        {
            try
            {
                var facility = await _repository.GetByIdAsync(id);
                if (facility == null)
                    return new ServiceResponse<FacilityDto> { Success = false, Message = "Không tìm thấy cơ sở." };

                var oldName = facility.Name; // Lưu tên cũ để dùng cho thông báo

                var imageUrls = new List<string>();
                if (dto.ExistingImageUrls != null)
                {
                    imageUrls.AddRange(dto.ExistingImageUrls);
                }

                if (dto.NewImages != null && dto.NewImages.Any())
                {
                    foreach (var imageFile in dto.NewImages)
                    {
                        var (isValid, errorMessage) = ImageUpload.ValidateImage(imageFile);
                        if (!isValid)
                        {
                            return new ServiceResponse<FacilityDto> { Success = false, Message = errorMessage };
                        }
                        var newImageUrl = await ImageUpload.SaveImageAsync(imageFile, _env.WebRootPath, "FacilityImages");
                        if (newImageUrl == null)
                        {
                            return new ServiceResponse<FacilityDto> { Success = false, Message = "Lỗi khi lưu file ảnh mới." };
                        }
                        imageUrls.Add(newImageUrl);
                    }
                }

                var imagesToDelete = facility.Images.Where(img => !imageUrls.Contains(img.ImageUrl)).ToList();
                foreach (var img in imagesToDelete)
                {
                    ImageUpload.DeleteImage(img.ImageUrl, _env.WebRootPath);
                }

                _mapper.Map(dto, facility);

                var currentImageUrls = facility.Images.Select(img => img.ImageUrl).ToList();
                
                if (!currentImageUrls.SequenceEqual(imageUrls))
                {
                    // Remove all current images manually from database to avoid tracking conflicts
                    var existingImages = await _repository.GetImagesByFacilityIdAsync(facility.FacId);
                    await _repository.RemoveImagesAsync(existingImages);
                    await _repository.SaveChangesAsync();
                    
                    // Clear the collection
                    facility.Images.Clear();
                    
                    // Add new images
                    var newImages = imageUrls.Select(url => new Image { ImageUrl = url, FacId = facility.FacId }).ToList();
                    await _repository.AddImagesAsync(newImages);
                    
                    // Update facility without images first
                    await _repository.UpdateAsync(facility);
                    await _repository.SaveChangesAsync();
                }
                else
                {
                    await _repository.UpdateAsync(facility);
                    await _repository.SaveChangesAsync();
                }

                var updatedFacility = await _repository.GetByIdAsync(id);

                // Gửi thông báo tới Admin khi có cơ sở được cập nhật
                if (oldName != updatedFacility?.Name)
                {
                    await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Cơ sở '{oldName}' đã được cập nhật thành '{updatedFacility.Name}'.");
                }
                else
                {
                    await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Thông tin cơ sở '{updatedFacility?.Name}' đã được cập nhật.");
                }

                return new ServiceResponse<FacilityDto>
                {
                    Success = true,
                    Message = "Cập nhật cơ sở thành công.",
                    Data = _mapper.Map<FacilityDto>(updatedFacility)
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<FacilityDto>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi cập nhật cơ sở: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<object>> DeleteFacility(int id)
        {
            try
            {
                var facility = await _repository.GetByIdAsync(id);
                if (facility == null)
                    return new ServiceResponse<object> { Success = false, Message = "Không tìm thấy cơ sở." };

                // Lấy tên cơ sở trước khi xóa
                var facilityName = facility.Name;

                await _repository.DeleteAsync(facility);
                await _repository.SaveChangesAsync();

                // Gửi thông báo tới Admin khi có cơ sở bị xóa
                await _hubContext.Clients.Group("Admin").SendAsync("ReceiveNotification", $"Cơ sở '{facilityName}' (ID: {id}) đã bị xóa.");

                return new ServiceResponse<object>
                {
                    Success = true,
                    Message = "Xóa cơ sở thành công."
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<object>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi xóa cơ sở: {ex.Message}"
                };
            }
        }

        public async Task<ServiceResponse<List<FacilityDto>>> GetFacilitiesByUserId(int userId)
        {
            try
            {
                var facilities = await _repository.GetByUserIdAsync(userId);
                var facilityDtos = _mapper.Map<List<FacilityDto>>(facilities);
                if (facilityDtos == null || !facilityDtos.Any())
                {
                    return new ServiceResponse<List<FacilityDto>>
                    {
                        Success = true,
                        Message = $"Không tìm thấy cơ sở nào cho người dùng có ID {userId}.",
                        Data = new List<FacilityDto>()
                    };
                }

                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = true,
                    Message = $"Lấy danh sách cơ sở cho người dùng có ID {userId} thành công.",
                    Data = facilityDtos
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<FacilityDto>>
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi khi lấy danh sách cơ sở cho người dùng có ID {userId}: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ServiceResponse<IEnumerable<string>>> GetCategoryFieldNamesByFacilityId(int facilityId)
        {
            var response = new ServiceResponse<IEnumerable<string>>();
            try
            {
                var categoryFields = await _repository.GetCategoryFieldsByFacilityIdAsync(facilityId);

                if (categoryFields == null || !categoryFields.Any())
                {
                    response.Success = false;
                    response.Message = $"Không tìm thấy loại sân nào cho cơ sở với ID {facilityId}.";
                    return response;
                }

                response.Data = categoryFields.Select(cf => cf.CategoryFieldName).ToList()!;
                response.Success = true;
                response.Message = $"Đã lấy tất cả tên loại sân cho cơ sở với ID {facilityId}.";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Đã xảy ra lỗi không mong muốn khi lấy tên loại sân theo cơ sở.";
            }
            return response;
        }
    }
}