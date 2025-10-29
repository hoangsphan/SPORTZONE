using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Service
{
    public int ServiceId { get; set; }

    public int? FacId { get; set; }

    public string? ServiceName { get; set; }

    public decimal? Price { get; set; }

    public string? Status { get; set; }

    public string? Image { get; set; }

    public string? Description { get; set; }

    public virtual Facility? Fac { get; set; }

    public virtual ICollection<OrderService> OrderServices { get; set; } = new List<OrderService>();
}
