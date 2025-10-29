using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class CategoryField
{
    public int CategoryFieldId { get; set; }

    public string? CategoryFieldName { get; set; }

    public virtual ICollection<Field> Fields { get; set; } = new List<Field>();
}
