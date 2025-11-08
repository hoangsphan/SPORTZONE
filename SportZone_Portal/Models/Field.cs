using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Field
{
    public int FieldId { get; set; }

    public int? FacId { get; set; }

    public int? CategoryId { get; set; }

    public string? FieldName { get; set; }

    public string? Description { get; set; }

    public bool? IsBookingEnable { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual CategoryField? Category { get; set; }

    public virtual Facility? Fac { get; set; }

    public virtual ICollection<FieldBookingSchedule> FieldBookingSchedules { get; set; } = new List<FieldBookingSchedule>();

    public virtual ICollection<FieldPricing> FieldPricings { get; set; } = new List<FieldPricing>();

    public virtual ICollection<OrderFieldId> OrderFieldIds { get; set; } = new List<OrderFieldId>();
}
