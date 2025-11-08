using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class RegulationSystemProfile : Profile
    {
        public RegulationSystemProfile()
        {
            CreateMap<RegulationSystemDto, RegulationSystem>();
        }
    }
}