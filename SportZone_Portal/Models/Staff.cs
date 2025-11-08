using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Staff
{
    public int UId { get; set; }

    public int? FacId { get; set; }

    public string? Name { get; set; }

    public string? Phone { get; set; }

    public DateOnly? Dob { get; set; }

    public string? Image { get; set; }

    public DateOnly? StartTime { get; set; }

    public DateOnly? EndTime { get; set; }

    public virtual Facility? Fac { get; set; }

    public virtual User UIdNavigation { get; set; } = null!;
}
