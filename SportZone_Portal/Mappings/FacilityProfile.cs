using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

public class FacilityProfile : Profile
{
    public FacilityProfile()
    {

            CreateMap<FacilityUpdateDto, Facility>()
                .ForMember(dest => dest.UId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.FacId, opt => opt.Ignore());

            CreateMap<Facility, FacilityDetailDto>()
                .ForMember(dest => dest.FacId, opt => opt.MapFrom(src => src.FacId))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UId))
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src =>
                    src.Images != null ? src.Images.Select(img => img.ImageUrl).ToList() : new List<string>()))
                .ForMember(dest => dest.CategoryFields, opt => opt.MapFrom(src =>
                    src.Fields != null ? src.Fields.Select(f => f.Category).Distinct().Where(c => c != null).ToList() : new List<CategoryField>()));

            CreateMap<CategoryField, CategoryFieldDto>();
        

        CreateMap<FacilityDto, Facility>()
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src =>
                src.Images != null ? new List<Image>() : new List<Image>()
            ))
            .ForMember(dest => dest.FacId, opt => opt.Ignore())
            .ForMember(dest => dest.UId, opt => opt.MapFrom(src => src.UserId));

        CreateMap<Facility, FacilityDto>()
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UId));

        CreateMap<FacilityUpdateDto, Facility>()
            .ForMember(dest => dest.UId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.FacId, opt => opt.Ignore());

    }
}