using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Notification
{
    public int NotiId { get; set; }

    public int UId { get; set; }

    public string? Content { get; set; }

    public string? Type { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? CreateAt { get; set; }

    public virtual User UIdNavigation { get; set; } = null!;
}
