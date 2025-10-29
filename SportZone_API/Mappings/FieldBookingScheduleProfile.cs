using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class FieldBookingScheduleProfile : Profile
    {
        public FieldBookingScheduleProfile()
        {
            CreateMap<FieldBookingSchedule, FieldBookingScheduleDto>().ReverseMap();
            //CreateMap<FieldBookingScheduleUpdateDto, FieldBookingSchedule>();
            CreateMap<FieldBookingScheduleUpdateGenerateDto, FieldBookingSchedule>();

            CreateMap<FieldPricingDto, FieldPricing>().ReverseMap();
            CreateMap<FieldPricingCreateDto, FieldPricing>();
            CreateMap<FieldPricingUpdateDto, FieldPricing>();
        }
    }
}
