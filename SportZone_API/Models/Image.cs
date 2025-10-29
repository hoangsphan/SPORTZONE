using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Image
{
    public int ImgId { get; set; }

    public int? FacId { get; set; }

    public string? ImageUrl { get; set; }

    public virtual Facility? Fac { get; set; }
}
