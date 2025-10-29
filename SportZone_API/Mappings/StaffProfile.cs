using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class StaffProfile : Profile
    {
        public StaffProfile()
        {
            CreateMap<Staff, StaffDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.UIdNavigation.UEmail))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.UIdNavigation.UStatus))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.UIdNavigation.Role.RoleName))
                .ForMember(dest => dest.FacilityName, opt => opt.MapFrom(src => src.Fac != null ? src.Fac.Name : null));

            CreateMap<UpdateStaffDto, Staff>()
                .ForMember(dest => dest.Name, opt => opt.Condition(src => src.Name != null))
                .ForMember(dest => dest.Phone, opt => opt.Condition(src => src.Phone != null))
                .ForMember(dest => dest.Dob, opt => opt.Condition(src => src.Dob.HasValue))
                .ForMember(dest => dest.Image, opt => opt.Ignore())
                .ForMember(dest => dest.FacId, opt => opt.Condition(src => src.FacId.HasValue))
                .ForMember(dest => dest.StartTime, opt => opt.Condition(src => src.StartTime.HasValue))
                .ForMember(dest => dest.EndTime, opt => opt.Condition(src => src.EndTime.HasValue));
        }
    }
}