using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class RegulationFacility
{
    public int RegulationFacilityId { get; set; }

    public int FacId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? Status { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public virtual Facility Fac { get; set; } = null!;
}
