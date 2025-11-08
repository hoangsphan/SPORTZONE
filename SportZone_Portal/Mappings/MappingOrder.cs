using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using System.Linq;
using System.Collections.Generic;

namespace SportZone_API.Mappings
{
    public class MappingOrder : Profile
    {
        public MappingOrder()
        {
            // Order Entity to OrderDTO
            CreateMap<Order, OrderDTO>()
                .ForMember(dest => dest.Services, opt => opt.MapFrom(src => src.OrderServices))
                .ReverseMap()
                .ForMember(dest => dest.OrderServices, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Booking, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Discount, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Fac, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.OrderFieldIds, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.UIdNavigation, opt => opt.Ignore()); // Navigation property

            // OrderCreateDTO to Order Entity
            CreateMap<OrderCreateDTO, Order>()
                .ForMember(dest => dest.OrderId, opt => opt.Ignore()) // Auto-generated
                .ForMember(dest => dest.DiscountId, opt => opt.Ignore()) // Set separately
                .ForMember(dest => dest.TotalServicePrice, opt => opt.Ignore()) // Calculated separately
                .ForMember(dest => dest.ContentPayment, opt => opt.Ignore()) // Set during payment
                .ForMember(dest => dest.OrderServices, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Booking, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Discount, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Fac, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.OrderFieldIds, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.UIdNavigation, opt => opt.Ignore()); // Navigation property

            // OrderService Entity to OrderDetailServiceDTO
            CreateMap<Models.OrderService, OrderDetailServiceDTO>()
                .ForMember(dest => dest.ServiceId, opt => opt.MapFrom(src => src.ServiceId ?? 0))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service != null ? src.Service.ServiceName : null))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Service != null ? src.Service.Image : null))
                .ReverseMap()
                .ForMember(dest => dest.OrderServiceId, opt => opt.Ignore()) // Auto-generated
                .ForMember(dest => dest.OrderId, opt => opt.Ignore()) // Set separately
                .ForMember(dest => dest.Order, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Service, opt => opt.Ignore()); // Navigation property

            // OrderFieldId Entity to OrderFieldIdDTO
            CreateMap<OrderFieldId, OrderFieldIdDTO>()
                .ForMember(dest => dest.FieldName, opt => opt.MapFrom(src => src.Field != null ? src.Field.FieldName : null))
                .ForMember(dest => dest.OrderInfo, opt => opt.MapFrom(src => $"Order #{src.OrderId} - Field #{src.FieldId}"))
                .ReverseMap()
                .ForMember(dest => dest.Field, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Order, opt => opt.Ignore()); // Navigation property

            // OrderFieldIdCreateDTO to OrderFieldId Entity
            CreateMap<OrderFieldIdCreateDTO, OrderFieldId>()
                .ForMember(dest => dest.OrderFieldId1, opt => opt.Ignore()) // Auto-generated
                .ForMember(dest => dest.Field, opt => opt.Ignore()) // Navigation property
                .ForMember(dest => dest.Order, opt => opt.Ignore()); // Navigation property

            // FieldBookingSchedule to BookingSlotDTO
            CreateMap<FieldBookingSchedule, BookingSlotDTO>()
                .ForMember(dest => dest.ScheduleId, opt => opt.MapFrom(src => src.ScheduleId))
                .ForMember(dest => dest.FieldId, opt => opt.MapFrom(src => src.FieldId ?? 0))
                .ForMember(dest => dest.FieldName, opt => opt.MapFrom(src => src.Field != null ? src.Field.FieldName : null))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Field != null && src.Field.Category != null ? src.Field.Category.CategoryFieldName : null))
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime ?? TimeOnly.MinValue))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.EndTime ?? TimeOnly.MinValue))
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date ?? DateOnly.MinValue))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));

            // Discount to DiscountInfoDTO
            CreateMap<Discount, OrderDiscountInfoDTO>()
                .ForMember(dest => dest.DiscountId, opt => opt.MapFrom(src => src.DiscountId))
                .ForMember(dest => dest.DiscountPercentage, opt => opt.MapFrom(src => src.DiscountPercentage))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.DiscountAmount, opt => opt.Ignore()); // Calculated separately
        }
    }
}