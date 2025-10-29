using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using AutoMapper;
using SportZone_API.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.Hubs;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using SportZone_API.Repositories;

namespace SportZone_API.Services
{
    public class FieldService : IFieldService
    {
        private readonly IFieldRepository _fieldRepository;
        private readonly IFacilityRepository _facilityRepository; 
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FieldService(
            IFieldRepository fieldRepository,
            IFacilityRepository facilityRepository, 
            IMapper mapper,
            IHubContext<NotificationHub> hubContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _fieldRepository = fieldRepository;
            _facilityRepository = facilityRepository; 
            _mapper = mapper;
            _hubContext = hubContext;
            _httpContextAccessor = httpContextAccessor;
        }

        // --- Các phương thức Read không thay đổi ---

        public async Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync()
        {
            try
            {
                return await _fieldRepository.GetAllFieldsAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetAllFieldsAsync(string? searchTerm)
        {
            try
            {
                return await _fieldRepository.GetAllFieldsAsync(searchTerm);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi tìm kiếm sân: {ex.Message}", ex);
            }
        }

        public async Task<FieldResponseDTO> GetFieldByIdAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân phải lớn hơn 0", nameof(fieldId));

                return await _fieldRepository.GetFieldByIdAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<Field?> GetFieldEntityByIdAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân phải lớn hơn 0", nameof(fieldId));
                return await _fieldRepository.GetFieldEntityByIdAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy thực thể sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByFacilityAsync(int facId)
        {
            try
            {
                if (facId <= 0)
                    throw new ArgumentException("ID cơ sở không hợp lệ");

                return await _fieldRepository.GetFieldsByFacilityAsync(facId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân theo cơ sở: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByCategoryAsync(int categoryId)
        {
            try
            {
                if (categoryId <= 0)
                    throw new ArgumentException("ID loại sân không hợp lệ");
                return await _fieldRepository.GetFieldsByCategoryAsync(categoryId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân theo loại: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldResponseDTO>> GetFieldsByUserIdAsync(int userId)
        {
            try
            {
                if (userId <= 0)
                    throw new ArgumentException("ID người dùng không hợp lệ");

                return await _fieldRepository.GetFieldsByUserIdAsync(userId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy danh sách sân theo user: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<FieldScheduleDTO>> GetFieldScheduleByFieldIdAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân không hợp lệ");

                if (!await _fieldRepository.FieldExistsAsync(fieldId))
                    throw new ArgumentException("Sân không tồn tại");

                return await _fieldRepository.GetFieldScheduleByFieldIdAsync(fieldId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi lấy lịch sân: {ex.Message}", ex);
            }
        }

        // --- Các phương thức Create, Update, Delete có áp dụng SignalR ---

        public async Task<Field> CreateFieldAsync(FieldCreateDTO fieldDto)
        {
            try
            {
                if (fieldDto == null)
                    throw new ArgumentNullException(nameof(fieldDto), "Dữ liệu sân không được để trống");

                if (string.IsNullOrWhiteSpace(fieldDto.FieldName))
                    throw new ArgumentException("Tên sân là bắt buộc");

                if (await _fieldRepository.FieldNameExistsInFacilityAsync(fieldDto.FieldName, fieldDto.FacId))
                    throw new ArgumentException($"Tên sân '{fieldDto.FieldName}' đã tồn tại trong cơ sở này");

                var newField = await _fieldRepository.CreateFieldAsync(fieldDto);

                if (newField.FacId.HasValue)
                {
                    // Sửa dòng này để gọi đúng Repository
                    var facility = await _facilityRepository.GetByIdAsync(newField.FacId.Value);

                    var message = new
                    {
                        Action = "Create",
                        Message = $"Sân mới '{newField.FieldName}' đã được tạo thành công tại cơ sở '{facility?.Name}'.",
                        Field = _mapper.Map<FieldResponseDTO>(newField)
                    };

                    await _hubContext.Clients.All.SendAsync("ReceiveFieldUpdate", message);
                }

                return newField;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi tạo sân: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateFieldAsync(int fieldId, FieldUpdateDTO fieldDto)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân không hợp lệ");
                if (fieldDto == null)
                    throw new ArgumentNullException(nameof(fieldDto), "Dữ liệu cập nhật không được để trống");
                if (!await _fieldRepository.FieldExistsAsync(fieldId))
                    throw new ArgumentException("Sân không tồn tại");

                var currentField = await _fieldRepository.GetFieldByIdAsync(fieldId);
                if (currentField != null && currentField.FacId.HasValue)
                {
                    if (!string.IsNullOrWhiteSpace(fieldDto.FieldName) && fieldDto.FieldName != currentField.FieldName)
                    {
                        var existingFields = await _fieldRepository.GetFieldsByFacilityAsync(currentField.FacId.Value);
                        if (existingFields.Any(f => f.FieldId != fieldId && f.FieldName == fieldDto.FieldName))
                        {
                            throw new ArgumentException($"Tên sân '{fieldDto.FieldName}' đã tồn tại trong cơ sở này");
                        }
                    }

                    var isSuccess = await _fieldRepository.UpdateFieldAsync(fieldId, fieldDto);
                    if (isSuccess)
                    {
                        var updatedField = await _fieldRepository.GetFieldByIdAsync(fieldId);

                        var message = new
                        {
                            Action = "Update",
                            Message = $"Thông tin sân '{currentField.FieldName}' đã được cập nhật thành công.",
                            Field = _mapper.Map<FieldResponseDTO>(updatedField)
                        };

                        await _hubContext.Clients.Group($"facility-{currentField.FacId.Value}").SendAsync("ReceiveFieldUpdate", message);
                    }
                    return isSuccess;
                }

                return false;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi cập nhật sân với ID {fieldId}: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteFieldAsync(int fieldId)
        {
            try
            {
                if (fieldId <= 0)
                    throw new ArgumentException("ID sân không hợp lệ", nameof(fieldId));

                var fieldToDelete = await _fieldRepository.GetFieldByIdAsync(fieldId);
                if (fieldToDelete == null)
                    throw new Exception("Sân không tồn tại");

                bool isDeleted = await _fieldRepository.DeleteFieldAsync(fieldId);
                if (isDeleted)
                {
                    if (fieldToDelete.FacId.HasValue)
                    {
                        var message = new
                        {
                            Action = "Delete",
                            Message = $"Sân '{fieldToDelete.FieldName}' đã bị xóa khỏi hệ thống.",
                            FieldId = fieldId
                        };
                        await _hubContext.Clients.Group($"facility-{fieldToDelete.FacId.Value}").SendAsync("ReceiveFieldUpdate", message);
                    }
                }
                return isDeleted;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi service khi xóa sân với ID {fieldId}: {ex.Message}", ex);
            }
        }
    }
}
