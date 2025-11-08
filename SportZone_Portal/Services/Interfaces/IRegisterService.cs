using SportZone_API.DTOs;
using System.Threading.Tasks;

namespace SportZone_API.Services.Interfaces
{
    public interface IRegisterService
    {
        Task<ServiceResponse<string>> RegisterUserAsync(RegisterDto dto);
    }
}