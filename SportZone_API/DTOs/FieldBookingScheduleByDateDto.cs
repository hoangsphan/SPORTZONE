namespace SportZone_API.DTOs
{
    public class FieldBookingScheduleByDateDto
    {
        public int FacilityId { get; set; }
        public string FacilityName { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public List<FieldWithSchedulesDto> Fields { get; set; } = new List<FieldWithSchedulesDto>();
    }

    public class FieldWithSchedulesDto
    {
        public int FieldId { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool? IsBookingEnable { get; set; }
        public CategoryFieldDto? Category { get; set; }
        public List<ScheduleDto> Schedules { get; set; } = new List<ScheduleDto>();
    }




    public class ScheduleDto
    {
        public int ScheduleId { get; set; }
        public int? BookingId { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
        public decimal? Price { get; set; }
        public BookingDto? Booking { get; set; }
    }

    public class BookingDto
    {
        public int BookingId { get; set; }
        public string? Title { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public string? Status { get; set; }
        public string? StatusPayment { get; set; }
    }
} 