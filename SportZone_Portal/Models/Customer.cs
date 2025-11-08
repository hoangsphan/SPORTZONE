using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Customer
{
    public int UId { get; set; }

    public string? Name { get; set; }

    public string? Phone { get; set; }

    public DateOnly? Dob { get; set; }

    public virtual User UIdNavigation { get; set; } = null!;
}
