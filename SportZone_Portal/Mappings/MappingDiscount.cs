using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class MappingDiscount : Profile
    {
        public MappingDiscount()
        {
            // Mapping từ Discount entity sang DiscountDTO
            CreateMap<Discount, DiscountDTO>()
                .ForMember(dest => dest.FacilityName, opt => opt.MapFrom(src => src.Fac != null ? src.Fac.Name : null));

            // Mapping từ DiscountCreateDTO sang Discount entity
            CreateMap<DiscountCreateDTO, Discount>();

            // Mapping từ DiscountUpdateDTO sang Discount entity (partial update)
            CreateMap<DiscountUpdateDTO, Discount>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}