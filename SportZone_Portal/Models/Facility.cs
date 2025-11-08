using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Facility
{
    public int FacId { get; set; }

    public int UId { get; set; }

    public string? Name { get; set; }

    public TimeOnly? OpenTime { get; set; }

    public TimeOnly? CloseTime { get; set; }

    public string? Address { get; set; }

    public string? Description { get; set; }

    public string? Subdescription { get; set; }

    public virtual ICollection<Discount> Discounts { get; set; } = new List<Discount>();

    public virtual ICollection<Field> Fields { get; set; } = new List<Field>();

    public virtual ICollection<Image> Images { get; set; } = new List<Image>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<RegulationFacility> RegulationFacilities { get; set; } = new List<RegulationFacility>();

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();

    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();

    public virtual FieldOwner UIdNavigation { get; set; } = null!;
}
