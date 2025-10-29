using SportZone_API.Models;
using System.ComponentModel.DataAnnotations;

namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO để tạo booking mới
    /// </summary>
    public class BookingCreateDTO
    {
        public int? UserId { get; set; }

        [MaxLength(100, ErrorMessage = "Tiêu đề không được quá 100 ký tự")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "Phải chọn ít nhất 1 slot thời gian")]
        [MinLength(1, ErrorMessage = "Phải chọn ít nhất 1 slot thời gian")]
        public List<int> SelectedSlotIds { get; set; } = new List<int>();

        // Validation fields - để validate và filter slots
        public int? FieldId { get; set; } // Nếu muốn restrict slots chỉ thuộc 1 field cụ thể
        public int? FacilityId { get; set; } // Validate slots thuộc facility này

        // Guest booking fields
        [MaxLength(100, ErrorMessage = "Tên khách không được quá 100 ký tự")]
        public string? GuestName { get; set; }

        [MaxLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự")]
        public string? GuestPhone { get; set; }

        // Optional services and discount
        public List<int>? ServiceIds { get; set; }
        public int? DiscountId { get; set; }

        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO tính toán tổng tiền với multiple slots
    /// </summary>
    public class CalculateAmountDTO
    {
        [Required(ErrorMessage = "Phải chọn ít nhất 1 slot thời gian")]
        [MinLength(1, ErrorMessage = "Phải chọn ít nhất 1 slot thời gian")]
        public List<int> SelectedSlotIds { get; set; } = new List<int>();

        public List<int>? ServiceIds { get; set; }
        public int? DiscountId { get; set; }
    }

    /// <summary>
    /// DTO để cập nhật booking
    /// </summary>
    public class BookingUpdateDTO
    {
        [MaxLength(100, ErrorMessage = "Tiêu đề không được quá 100 ký tự")]
        public string? Title { get; set; }

        public DateOnly? Date { get; set; }

        public TimeOnly? StartTime { get; set; }

        public TimeOnly? EndTime { get; set; }

        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO response cho booking
    /// </summary>
    public class BookingResponseDTO
    {
        public int BookingId { get; set; }
        public int FieldId { get; set; }
        public string? FieldName { get; set; }
        public string? FacilityName { get; set; }
        public string? FacilityAddress { get; set; }
        public int? UserId { get; set; }
        public string? CustomerName { get; set; }
        public string? Title { get; set; }
        public DateOnly? Date { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? Status { get; set; }
        public string? StatusPayment { get; set; }
        public DateTime? CreateAt { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public decimal? FieldPrice { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? Notes { get; set; }

        // Related services
        public List<BookingServiceDTO>? Services { get; set; }
    }

    /// <summary>
    /// DTO chi tiết đầy đủ của booking
    /// </summary>
    public class BookingDetailDTO : BookingResponseDTO
    {
        public FieldInfoDTO? Field { get; set; }
        public CustomerInfoDTO? Customer { get; set; }
        public OrderInfoDTO? Order { get; set; }

        public List<BookingSlotDetailDTO>? BookedSlots { get; set; }

    }

    /// <summary>
    /// DTO chi tiết slot trong booking
    /// </summary>
    public class BookingSlotDetailDTO
    {
        public int ScheduleId { get; set; }
        public int FieldId { get; set; }
        public string? FieldName { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public decimal? Price { get; set; }
        public string Status { get; set; } = "Booked";
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO thông tin sân trong booking
    /// </summary>
    public class FieldInfoDTO
    {
        public int FieldId { get; set; }
        public string? FieldName { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? CategoryName { get; set; }
        public FacilityInfoDTO? Facility { get; set; }
    }

    /// <summary>
    /// DTO thông tin cơ sở trong booking
    /// </summary>
    public class FacilityInfoDTO
    {
        public int FacId { get; set; }
        public string? Address { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? CloseTime { get; set; }
        public string? Description { get; set; }
    }

    /// <summary>
    /// DTO thông tin khách hàng trong booking
    /// </summary>
    public class CustomerInfoDTO
    {
        public int UserId { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    /// <summary>
    /// DTO thông tin đơn hàng trong booking
    /// </summary>
    public class OrderInfoDTO
    {
        public int OrderId { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? StatusPayment { get; set; }
        public string? ContentPayment { get; set; }
        public DateTime? CreateAt { get; set; }
        public List<BookingServiceDTO>? Services { get; set; }
        public DiscountInfoDTO? Discount { get; set; }
    }

    /// <summary>
    /// DTO dịch vụ trong booking
    /// </summary>
    public class BookingServiceDTO
    {
        public int ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public decimal? TotalPrice { get; set; }
    }

    /// <summary>
    /// DTO thông tin giảm giá
    /// </summary>
    public class DiscountInfoDTO
    {
        public int DiscountId { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public string? Description { get; set; }
    }

    /// <summary>
    /// DTO lọc lịch sử booking
    /// </summary>
    public class BookingHistoryFilterDTO
    {
        public int? UserId { get; set; }
        public string? Status { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    }

    /// <summary>
    /// DTO để tích hợp booking với payment
    /// </summary>
    public class BookingWithPaymentDto
    {
        public BookingCreateDTO BookingData { get; set; }
        public VNPayRequestDto PaymentData { get; set; }
    }

    /// <summary>
    /// Static class chứa các mapping methods cho Booking
    /// </summary>
    /// 
    public static class BookingMapper
    {
        /// <summary>
        /// Map từ Booking entity sang BookingResponseDTO
        /// </summary>
        public static BookingResponseDTO MapToBookingResponseDTO(Booking booking)
        {
            var schedule = booking.FieldBookingSchedules?.FirstOrDefault();

            // Calculate FieldPrice from FieldPricing
            decimal? fieldPrice = null;
            if (booking.StartTime.HasValue && booking.EndTime.HasValue && booking.Field?.FieldPricings != null)
            {
                var pricing = booking.Field.FieldPricings.FirstOrDefault(p =>
                    p.StartTime == booking.StartTime.Value &&
                    p.EndTime == booking.EndTime.Value);
                fieldPrice = pricing?.Price;
            }

            return new BookingResponseDTO
            {
                BookingId = booking.BookingId,
                FieldId = booking.FieldId,
                FieldName = booking.Field?.FieldName,
                FacilityName = booking.Field?.Fac != null ? $"Cơ sở {booking.Field.FacId}" : null,
                FacilityAddress = booking.Field?.Fac?.Address,
                UserId = booking.UId,
                CustomerName = booking.UIdNavigation?.Customer?.Name,
                Title = booking.Title,
                Date = booking.Date,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Status = booking.Status,
                StatusPayment = booking.StatusPayment,
                CreateAt = booking.CreateAt,
                GuestName = booking.GuestName,
                GuestPhone = booking.GuestPhone,
                FieldPrice = fieldPrice,
                Notes = schedule?.Notes
            };
        }

        /// <summary>
        /// Map từ Booking entity sang BookingDetailDTO
        /// </summary>
        public static BookingDetailDTO MapToBookingDetailDTO(Booking booking)
        {
            var responseDto = MapToBookingResponseDTO(booking);

            return new BookingDetailDTO
            {
                BookingId = responseDto.BookingId,
                FieldId = responseDto.FieldId,
                FieldName = responseDto.FieldName,
                FacilityName = responseDto.FacilityName,
                FacilityAddress = responseDto.FacilityAddress,
                UserId = responseDto.UserId,
                CustomerName = responseDto.CustomerName,
                Title = responseDto.Title,
                Date = responseDto.Date,
                StartTime = responseDto.StartTime,
                EndTime = responseDto.EndTime,
                Status = responseDto.Status,
                StatusPayment = responseDto.StatusPayment,
                CreateAt = responseDto.CreateAt,
                GuestName = responseDto.GuestName,
                GuestPhone = responseDto.GuestPhone,
                FieldPrice = responseDto.FieldPrice,
                Notes = responseDto.Notes,

                Field = booking.Field != null ? new FieldInfoDTO
                {
                    FieldId = booking.Field.FieldId,
                    FieldName = booking.Field.FieldName,
                    Description = booking.Field.Description,
                    Price = responseDto.FieldPrice, // Use the calculated FieldPrice
                    CategoryName = booking.Field.Category?.CategoryFieldName,
                    Facility = booking.Field.Fac != null ? new FacilityInfoDTO
                    {
                        FacId = booking.Field.Fac.FacId,
                        Address = booking.Field.Fac.Address,
                        OpenTime = booking.Field.Fac.OpenTime,
                        CloseTime = booking.Field.Fac.CloseTime,
                        Description = booking.Field.Fac.Description
                    } : null
                } : null,

                Customer = booking.UIdNavigation?.Customer != null ? new CustomerInfoDTO
                {
                    UserId = booking.UId ?? 0, // Safe cast since UIdNavigation is not null
                    Name = booking.UIdNavigation.Customer?.Name,
                    Phone = booking.UIdNavigation.Customer?.Phone,
                    Email = booking.UIdNavigation?.UEmail
                } : null,

                Order = booking.Orders?.FirstOrDefault() != null ? new OrderInfoDTO
                {
                    OrderId = booking.Orders.First().OrderId,
                    TotalAmount = booking.Orders.First().TotalPrice,
                    StatusPayment = booking.Orders.First().StatusPayment,
                    ContentPayment = booking.Orders.First().ContentPayment,
                    CreateAt = booking.Orders.First().CreateAt,
                    Services = booking.Orders.First().OrderServices?.Select(os => new BookingServiceDTO
                    {
                        ServiceId = os.Service?.ServiceId ?? 0,
                        ServiceName = os.Service?.ServiceName,
                        Price = os.Service?.Price,
                        Quantity = os.Quantity,
                        TotalPrice = (os.Service?.Price ?? 0) * (os.Quantity ?? 1)
                    }).ToList(),
                    Discount = booking.Orders.First().Discount != null ? new DiscountInfoDTO
                    {
                        DiscountId = booking.Orders.First().Discount.DiscountId,
                        DiscountPercentage = booking.Orders.First().Discount.DiscountPercentage,
                        Description = booking.Orders.First().Discount.Description
                    } : null
                } : null,

                BookedSlots = booking.FieldBookingSchedules?.Select(slot => new BookingSlotDetailDTO
                {
                    ScheduleId = slot.ScheduleId,
                    FieldId = slot.FieldId ?? 0,
                    FieldName = slot.Field?.FieldName,
                    Date = slot.Date ?? DateOnly.MinValue,
                    StartTime = slot.StartTime ?? TimeOnly.MinValue,
                    EndTime = slot.EndTime ?? TimeOnly.MinValue,
                    Price = slot.Price,
                    Status = slot.Status ?? "Booked",
                    Notes = slot.Notes
                }).OrderBy(s => s.Date).ThenBy(s => s.StartTime).ToList()
            };
        }
    }
}
