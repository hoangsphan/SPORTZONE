using SportZone_API.DTOs;

namespace SportZone_API.Services.Interfaces
{
    public interface IVNPayService
    {
        Task<ServiceResponse<VNPayResponseDto>> CreatePaymentUrl(VNPayRequestDto request);
        Task<ServiceResponse<bool>> VerifyPaymentReturn(VNPayReturnDto returnData);
        string CreatePaymentUrl(VNPayRequestDto request, string ipAddress);
        bool VerifyPaymentReturn(VNPayReturnDto returnData, string ipAddress);
    }
} 