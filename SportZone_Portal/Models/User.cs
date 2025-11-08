using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class User
{
    public int UId { get; set; }

    public int? RoleId { get; set; }

    public string? UEmail { get; set; }

    public string? UPassword { get; set; }

    public string? UStatus { get; set; }

    public DateTime? UCreateDate { get; set; }

    public bool? IsExternalLogin { get; set; }

    public bool? IsVerify { get; set; }

    public virtual Admin? Admin { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual Customer? Customer { get; set; }

    public virtual ExternalLogin? ExternalLogin { get; set; }

    public virtual FieldOwner? FieldOwner { get; set; }

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Role? Role { get; set; }

    public virtual Staff? Staff { get; set; }
}
