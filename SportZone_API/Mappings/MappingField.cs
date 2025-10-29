using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class MappingField : Profile
    {
        public MappingField()
        {
            // Field Mappings
            CreateMap<FieldCreateDTO, Field>()
                .ForMember(dest => dest.FieldId, opt => opt.Ignore()) 
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Fac, opt => opt.Ignore()); 

            CreateMap<FieldUpdateDTO, Field>()
                .ForMember(dest => dest.FieldId, opt => opt.Ignore())
                .ForMember(dest => dest.FacId, opt => opt.Ignore()) 
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Fac, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)); 

            CreateMap<Field, FieldResponseDTO>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryFieldName : null))
                .ForMember(dest => dest.FacilityAddress, opt => opt.MapFrom(src => src.Fac != null ? src.Fac.Address : null));

            // Category Mappings
            CreateMap<CategoryField, CategoryFieldResponseDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CategoryFieldId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.CategoryFieldName));
        }
    }

    public class CategoryFieldResponseDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
    }
}