using AutoMapper;
using SportZone_API.DTOs; 
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportZone_API.Services
{
    public class CategoryFieldService : ICategoryFieldService
    {
        private readonly ICategoryFieldRepository _categoryFieldRepository;
        private readonly IMapper _mapper;

        public CategoryFieldService(ICategoryFieldRepository categoryFieldRepository, IMapper mapper)
        {
            _categoryFieldRepository = categoryFieldRepository;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<CategoryFieldDto>> GetCategoryFieldById(int id)
        {
            var response = new ServiceResponse<CategoryFieldDto>();
            try
            {
                var categoryField = await _categoryFieldRepository.GetByIdAsync(id);

                if (categoryField == null)
                {
                    response.Success = false;
                    response.Message = $"Loại sân với ID {id} không tìm thấy.";
                    return response;
                }

                response.Data = _mapper.Map<CategoryFieldDto>(categoryField);
                response.Success = true;
                response.Message = "Thành công.";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Đã xảy ra lỗi không mong muốn khi lấy thông tin loại sân.";
            }
            return response;
        }

        public async Task<ServiceResponse<string>> GetCategoryFieldNameById(int id)
        {
            var response = new ServiceResponse<string>();
            try
            {
                var categoryField = await _categoryFieldRepository.GetByIdAsync(id);

                if (categoryField == null)
                {
                    response.Success = false;
                    response.Message = $"Loại sân với ID {id} không tìm thấy.";
                    return response;
                }

                response.Data = categoryField.CategoryFieldName;
                response.Success = true;
                response.Message = $"Đã lấy tên loại sân cho ID {id}.";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Đã xảy ra lỗi không mong muốn khi lấy tên loại sân.";
            }
            return response;
        }

        public async Task<ServiceResponse<IEnumerable<CategoryFieldDto>>> GetAllCategoryFields()
        {
            var response = new ServiceResponse<IEnumerable<CategoryFieldDto>>();
            try
            {
                var categoryFields = await _categoryFieldRepository.GetAllAsync();
                response.Data = _mapper.Map<IEnumerable<CategoryFieldDto>>(categoryFields);
                response.Success = true;
                response.Message = "Thành công.";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Đã xảy ra lỗi không mong muốn khi lấy tất cả loại sân.";
            }
            return response;
        }
    }
}