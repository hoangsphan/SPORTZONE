using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class FieldBookingSchedule
{
    public int ScheduleId { get; set; }

    public int? FieldId { get; set; }

    public int? BookingId { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public DateOnly? Date { get; set; }

    public string? Notes { get; set; }

    public string? Status { get; set; }

    public decimal? Price { get; set; }

    public virtual Booking? Booking { get; set; }

    public virtual Field? Field { get; set; }
}
