namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO để tạo OrderFieldId
    /// </summary>
    public class OrderFieldIdCreateDTO
    {
        public int OrderId { get; set; }
        public int FieldId { get; set; }
    }

    /// <summary>
    /// DTO response cho OrderFieldId
    /// </summary>
    public class OrderFieldIdDTO
    {
        public int OrderFieldId1 { get; set; }
        public int? OrderId { get; set; }
        public int? FieldId { get; set; }
        public string? FieldName { get; set; }
        public string? OrderInfo { get; set; }
    }
}
