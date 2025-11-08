using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using System;

namespace SportZone_API.Mappings
{
    public class RegisterProfile : Profile
    {
        public RegisterProfile()
        {
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.UEmail, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.UStatus, opt => opt.MapFrom(_ => "Active"))
                .ForMember(dest => dest.UCreateDate, opt => opt.MapFrom(_ => DateTime.Now))
                .ForMember(dest => dest.IsExternalLogin, opt => opt.MapFrom(_ => false))
                .ForMember(dest => dest.IsVerify, opt => opt.MapFrom(_ => true))
                .ForMember(dest => dest.RoleId, opt => opt.Ignore())
                .ForMember(dest => dest.UPassword, opt => opt.Ignore());

            CreateMap<RegisterDto, Customer>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.Dob, opt => opt.Ignore())
                .ForMember(dest => dest.UId, opt => opt.Ignore());

            CreateMap<RegisterDto, FieldOwner>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.Dob, opt => opt.Ignore())
                .ForMember(dest => dest.UId, opt => opt.Ignore());

            CreateMap<RegisterDto, Staff>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.Dob, opt => opt.MapFrom(src => src.Dob))
                .ForMember(dest => dest.Image, opt => opt.Ignore())
                .ForMember(dest => dest.FacId, opt => opt.MapFrom(src => src.FacId))
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.EndTime))
                .ForMember(dest => dest.UId, opt => opt.Ignore());
           
            CreateMap<RegisterDto, Admin>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.Dob, opt => opt.MapFrom(src => src.Dob))
                .ForMember(dest => dest.UId, opt => opt.Ignore());
        }
    }
}