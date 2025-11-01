using SportZone_Blazor.Models;

namespace SportZone_Blazor.Services;

public interface IOrderService
{
    Task<OrderModel?> GetOrderAsync(int orderId, CancellationToken cancellationToken = default);

    Task<OwnerRevenueModel?> GetOwnerRevenueAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null, int? facilityId = null, CancellationToken cancellationToken = default);
}
