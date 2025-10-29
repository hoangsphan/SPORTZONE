using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using SportZone_API.DTOs;
using SportZone_API.Hubs;
using SportZone_API.Models;
using SportZone_API.Repositories;
using SportZone_API.Repositories.Interfaces;
using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class DiscountService : IDiscountService
    {
        private readonly IDiscountRepository _repository;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public DiscountService(IDiscountRepository repository, IMapper mapper, IHubContext<NotificationHub> hubContext)
        {
            _repository = repository;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<List<Discount>> GetAllDiscounts()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Discount?> GetDiscountById(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<List<Discount>> GetDiscountsByFacilityId(int facId)
        {
            return await _repository.GetByFacilityIdAsync(facId);
        }

        public async Task<List<Discount>> GetActiveDiscounts()
        {
            return await _repository.GetActiveDiscountsAsync();
        }

        public async Task<List<Discount>> GetActiveDiscountsByFacility(int facId)
        {
            return await _repository.GetActiveDiscountsByFacilityAsync(facId);
        }

        public async Task<ServiceResponse<Discount>> CreateDiscount(DiscountDto dto)
        {
            var discount = _mapper.Map<Discount>(dto);
            await _repository.AddAsync(discount);
            await _repository.SaveChangesAsync();

            // Gửi thông báo real-time khi mã giảm giá mới được tạo
            var createdDiscountDto = _mapper.Map<DiscountDto>(discount);
            var message = $"Chương trình giảm giá mới '{discount.Description}' đã được tạo, giảm {discount.DiscountPercentage}%.";

            // Thông báo cho người quản lý cơ sở liên quan
            await _hubContext.Clients.Group($"facility-{discount.FacId}").SendAsync("ReceiveNotification", message);
            // Gửi dữ liệu mã giảm giá mới để client cập nhật giao diện
            await _hubContext.Clients.Group($"facility-{discount.FacId}").SendAsync("DiscountCreated", createdDiscountDto);

            return new ServiceResponse<Discount>
            {
                Success = true,
                Message = "Tạo giảm giá thành công.",
                Data = discount
            };
        }

        public async Task<ServiceResponse<Discount>> UpdateDiscount(int id, DiscountDto dto)
        {
            var discount = await _repository.GetByIdAsync(id);
            if (discount == null)
                return new ServiceResponse<Discount> { Success = false, Message = "Không tìm thấy giảm giá." };

            var oldFacId = discount.FacId;
            _mapper.Map(dto, discount);
            await _repository.UpdateAsync(discount);
            await _repository.SaveChangesAsync();

            // Gửi thông báo real-time khi mã giảm giá được cập nhật
            var updatedDiscountDto = _mapper.Map<DiscountDto>(discount);
            var message = $"Chương trình giảm giá '{discount.Description}' đã được cập nhật.";

            // Thông báo cho quản lý cơ sở cũ nếu mã giảm giá bị chuyển đi
            if (oldFacId != discount.FacId)
            {
                await _hubContext.Clients.Group($"facility-{oldFacId}").SendAsync("ReceiveNotification", message);
                // Gửi ID của mã giảm giá đã xóa để client gỡ bỏ khỏi giao diện
                await _hubContext.Clients.Group($"facility-{oldFacId}").SendAsync("DiscountDeleted", id);
            }

            // Gửi thông báo đến quản lý cơ sở mới
            await _hubContext.Clients.Group($"facility-{discount.FacId}").SendAsync("ReceiveNotification", message);
            // Gửi dữ liệu cập nhật để client làm mới giao diện
            await _hubContext.Clients.Group($"facility-{discount.FacId}").SendAsync("DiscountUpdated", updatedDiscountDto);

            return new ServiceResponse<Discount>
            {
                Success = true,
                Message = "Cập nhật giảm giá thành công.",
                Data = discount
            };
        }

        public async Task<ServiceResponse<Discount>> DeleteDiscount(int id)
        {
            var discount = await _repository.GetByIdAsync(id);
            if (discount == null)
                return new ServiceResponse<Discount> { Success = false, Message = "Không tìm thấy giảm giá." };

            var facId = discount.FacId;
            await _repository.DeleteAsync(discount);
            await _repository.SaveChangesAsync();

            // Gửi thông báo real-time khi mã giảm giá bị xóa
            var message = $"Chương trình giảm giá '{discount.Description}' đã bị xóa.";

            // Gửi thông báo đến quản lý cơ sở liên quan
            await _hubContext.Clients.Group($"facility-{facId}").SendAsync("ReceiveNotification", message);
            // Gửi ID của mã giảm giá đã xóa để client gỡ bỏ khỏi giao diện
            await _hubContext.Clients.Group($"facility-{facId}").SendAsync("DiscountDeleted", id);

            return new ServiceResponse<Discount>
            {
                Success = true,
                Message = "Xóa giảm giá thành công.",
                Data = discount
            };
        }

        public async Task<List<Discount>> SearchDiscounts(string text)
        {
            return await _repository.SearchAsync(text);
        }

        public async Task<decimal> CalculateDiscountedPriceAsync(decimal originalPrice, int? discountId, int facId)
        {
            try
            {
                if (!discountId.HasValue)
                    return originalPrice;

                // Validate discount
                var isValidDiscount = await _repository.ValidateDiscountAsync(discountId.Value, facId);
                if (!isValidDiscount)
                {
                    throw new ArgumentException($"Discount ID {discountId} không hợp lệ hoặc không áp dụng được cho Facility {facId}");
                }

                // Lấy thông tin discount
                var discount = await _repository.GetDiscountByIdAsync(discountId.Value);
                if (discount == null)
                {
                    throw new ArgumentException($"Không tìm thấy Discount với ID {discountId}");
                }

                // Tính giá sau discount
                var discountAmount = originalPrice * (discount.DiscountPercentage ?? 0) / 100;
                var discountedPrice = originalPrice - discountAmount;

                return discountedPrice;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tính giá sau discount: {ex.Message}", ex);
            }
        }

        public async Task<bool> DecreaseDiscountQuantityAsync(int discountId)
        {
            try
            {
                return await _repository.DecreaseDiscountQuantityAsync(discountId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi giảm quantity discount: {ex.Message}", ex);
            }
        }
    }
}