using AutoMapper;
using SportZone_API.DTOs;
using SportZone_API.Models;
using System.Linq;
using System.Collections.Generic;

namespace SportZone_API.Mappings
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            //// OrderFieldIdCreateDTO to OrderFieldId Entity
            //CreateMap<OrderFieldIdCreateDTO, OrderFieldId>()
            //    .ForMember(dest => dest.OrderFieldId1, opt => opt.Ignore()) // Auto-generated
            //    .ForMember(dest => dest.Field, opt => opt.Ignore()) // Navigation property
            //    .ForMember(dest => dest.Order, opt => opt.Ignore()); // Navigation property
            //CreateMap<Order, OrderDTO>()
            //    .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src =>
            //        src.Booking != null ?
            //            (string.IsNullOrEmpty(src.Booking.GuestName) ? src.GuestName : src.Booking.GuestName) : src.GuestName))
            //    .ForMember(dest => dest.CustomerPhone, opt => opt.MapFrom(src =>
            //        src.Booking != null ?
            //            (string.IsNullOrEmpty(src.Booking.GuestPhone) ? src.GuestPhone : src.Booking.GuestPhone) : src.GuestPhone))
            //    .ForMember(dest => dest.BookingDate, opt => opt.MapFrom(src =>
            //        src.Booking != null && src.Booking.Date.HasValue ?
            //            src.Booking.Date.Value.ToString("dd/MM/yyyy") :
            //            null))
            //    .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.ContentPayment))
            //    .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => src.StatusPayment))
            //    .ForMember(dest => dest.BookedSlots, opt => opt.MapFrom(src =>
            //        src.Booking != null && src.Booking.FieldBookingSchedules != null && src.Booking.FieldBookingSchedules.Any()
            //            ? src.Booking.FieldBookingSchedules
            //                .OrderBy(fs => fs.StartTime)
            //                .Select(fs => $"{fs.StartTime:HH\\:mm} - {fs.EndTime:HH\\:mm}")
            //                .ToList()
            //            : new List<string>()))
            //    .ForMember(dest => dest.FieldRentalPrice, opt => opt.MapFrom(src =>
            //        src.Booking != null && src.Booking.FieldBookingSchedules != null ? src.Booking.FieldBookingSchedules.Sum(fs => fs.Price) : 0m))
            //    .ForMember(dest => dest.DiscountAmount, opt => opt.MapFrom(src =>
            //        src.Discount != null && src.Discount.DiscountPercentage.HasValue && src.Discount.DiscountPercentage.Value > 0
            //            ? (src.Discount.DiscountPercentage.Value / 100m) * (src.Booking != null && src.Booking.FieldBookingSchedules != null ? src.Booking.FieldBookingSchedules.Sum(fs => fs.Price) : 0m)
            //            : 0m
            //    ))
            //    .ForMember(dest => dest.TotalServicePrice, opt => opt.Ignore())
            //    .ForMember(dest => dest.Deposit, opt => opt.Ignore())
            //    .ForMember(dest => dest.TotalPrice, opt => opt.Ignore())
            //    .ForMember(dest => dest.Services, opt => opt.MapFrom(src => src.OrderServices));

            //CreateMap<OrderService, OrderDetailServiceDTO>()
            //    .ForMember(dest => dest.ServiceId, opt => opt.MapFrom(src => src.ServiceId ?? 0))
            //    .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service != null ? src.Service.ServiceName : null))
            //    .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price ?? 0m))
            //    .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity ?? 0))
            //    .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Service != null ? src.Service.Image : null));
        }
    }
}