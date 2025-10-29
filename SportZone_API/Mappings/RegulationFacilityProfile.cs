using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;

namespace SportZone_API.Mappings
{
    public class RegulationFacilityProfile : Profile
    {
        public RegulationFacilityProfile()
        {
            CreateMap<RegulationFacilityDto, RegulationFacility>();
        }
    }
}