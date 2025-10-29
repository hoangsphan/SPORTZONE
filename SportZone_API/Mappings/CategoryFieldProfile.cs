using AutoMapper;
using SportZone_API.Models;
using SportZone_API.DTOs;

public class CategoryFieldProfile : Profile
{
    public CategoryFieldProfile()
    {
        CreateMap<CategoryField, CategoryFieldDto>();
    }
}