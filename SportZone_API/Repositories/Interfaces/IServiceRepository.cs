using SportZone_API.Models;

namespace SportZone_API.Repositories.Interfaces
{
    public interface IServiceRepository
    {
        // Lấy tất cả Services
        Task<IEnumerable<Service>> GetAllServicesAsync();

        // Lấy Service theo ID
        Task<Service?> GetServiceByIdAsync(int serviceId);

        // Lấy Services theo Facility ID
        Task<IEnumerable<Service>> GetServicesByFacilityIdAsync(int facilityId);

        // Lấy Services theo trạng thái
        Task<IEnumerable<Service>> GetServicesByStatusAsync(string status);

        // Tạo Service mới
        Task<Service> CreateServiceAsync(Service service);

        // Cập nhật Service
        Task<Service> UpdateServiceAsync(Service service);

        // Xóa Service
        Task<bool> DeleteServiceAsync(int serviceId);
        Task<bool> ServiceExistsByIdAsync(int serviceId);

        // Kiểm tra Facility có tồn tại
        Task<bool> FacilityExistsAsync(int facilityId);

        // Lấy tổng số Services
        Task<int> GetTotalServicesCountAsync();

        // Lấy Services với phân trang
        Task<IEnumerable<Service>> GetServicesWithPaginationAsync(int pageNumber, int pageSize);
    }
}
