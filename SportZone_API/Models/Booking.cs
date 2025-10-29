using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int FieldId { get; set; }

    public int? UId { get; set; }

    public string? Title { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public DateOnly? Date { get; set; }

    public string? Status { get; set; }

    public string? StatusPayment { get; set; }

    public DateTime? CreateAt { get; set; }

    public string? GuestName { get; set; }

    public string? GuestPhone { get; set; }

    public virtual Field Field { get; set; } = null!;

    public virtual ICollection<FieldBookingSchedule> FieldBookingSchedules { get; set; } = new List<FieldBookingSchedule>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual User? UIdNavigation { get; set; }
}
