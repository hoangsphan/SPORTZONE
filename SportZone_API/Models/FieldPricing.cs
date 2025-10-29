using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class FieldPricing
{
    public int PricingId { get; set; }

    public int FieldId { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public decimal Price { get; set; }

    public virtual Field Field { get; set; } = null!;
}
