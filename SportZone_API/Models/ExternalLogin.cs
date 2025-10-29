using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class ExternalLogin
{
    public int UId { get; set; }

    public string? ExternalProvider { get; set; }

    public string? ExternalUserId { get; set; }

    public string? AccessToken { get; set; }

    public virtual User UIdNavigation { get; set; } = null!;
}
