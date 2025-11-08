using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int UId { get; set; }

    public string? ImageQr { get; set; }

    public string? BankCode { get; set; }

    public string? BankNum { get; set; }

    public string? AccountName { get; set; }

    public virtual User UIdNavigation { get; set; } = null!;
}
