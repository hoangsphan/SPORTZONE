using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class MappingService : Profile
    {
        public MappingService()
        {
            // Service Entity to ServiceDTO
            CreateMap<Service, ServiceDTO>()
                .ForMember(dest => dest.FacilityAddress, opt => opt.MapFrom(src => src.Fac != null ? src.Fac.Address : null));

            // Service Entity to ServiceResponseDTO
            CreateMap<Service, ServiceResponseDTO>()
                .ForMember(dest => dest.Facility, opt => opt.MapFrom(src => src.Fac))
                .ForMember(dest => dest.OrderCount, opt => opt.MapFrom(src => src.OrderServices.Count));

            CreateMap<CreateServiceDTO, Service>()
            .ForMember(dest => dest.ServiceId, opt => opt.Ignore())
            .ForMember(dest => dest.Fac, opt => opt.Ignore())
            .ForMember(dest => dest.OrderServices, opt => opt.Ignore())
            .ForMember(dest => dest.Image, opt => opt.Ignore());

            // UpdateServiceDTO to Service Entity
            CreateMap<UpdateServiceDTO, Service>()
                .ForMember(dest => dest.ServiceId, opt => opt.Ignore())
                .ForMember(dest => dest.Fac, opt => opt.Ignore())
                .ForMember(dest => dest.OrderServices, opt => opt.Ignore())
                .ForMember(dest => dest.Image, opt => opt.Ignore()) 
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Facility Entity to FacilityInfoDTO
            CreateMap<Facility, FacilityInfoDTO>();
        }
    }
}
