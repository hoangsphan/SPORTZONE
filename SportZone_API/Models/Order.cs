using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int? UId { get; set; }

    public int FacId { get; set; }

    public int? DiscountId { get; set; }

    public int? BookingId { get; set; }

    public string? GuestName { get; set; }

    public string? GuestPhone { get; set; }

    public decimal? TotalPrice { get; set; }

    public decimal? TotalServicePrice { get; set; }

    public string? ContentPayment { get; set; }

    public string? StatusPayment { get; set; }

    public DateTime? CreateAt { get; set; }

    public virtual Booking? Booking { get; set; }

    public virtual Discount? Discount { get; set; }

    public virtual Facility Fac { get; set; } = null!;

    public virtual ICollection<OrderFieldId> OrderFieldIds { get; set; } = new List<OrderFieldId>();

    public virtual ICollection<OrderService> OrderServices { get; set; } = new List<OrderService>();

    public virtual User? UIdNavigation { get; set; }
}
