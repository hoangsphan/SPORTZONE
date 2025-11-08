using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Discount
{
    public int DiscountId { get; set; }

    public int FacId { get; set; }

    public decimal? DiscountPercentage { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? Description { get; set; }

    public bool? IsActive { get; set; }

    public int? Quantity { get; set; }

    public virtual Facility Fac { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
