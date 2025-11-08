using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class FieldOwner
{
    public int UId { get; set; }

    public string? Name { get; set; }

    public string? Phone { get; set; }

    public DateOnly? Dob { get; set; }

    public virtual ICollection<Facility> Facilities { get; set; } = new List<Facility>();

    public virtual User UIdNavigation { get; set; } = null!;
}
