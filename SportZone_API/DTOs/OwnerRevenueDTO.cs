namespace SportZone_API.DTOs
{
    /// <summary>
    /// DTO cho thống kê doanh thu theo cơ sở
    /// </summary>
    public class FacilityRevenueDTO
    {
        public int FacilityId { get; set; }
        public string? FacilityName { get; set; }
        public decimal Revenue { get; set; }
        public decimal FieldRevenue { get; set; }
        public decimal ServiceRevenue { get; set; }
        public int OrderCount { get; set; }
    }

    /// <summary>
    /// DTO cho thống kê doanh thu theo thời gian
    /// </summary>
    public class TimeRevenueDTO
    {
        public string Period { get; set; } = string.Empty; // "2024-01", "2024-Q1", "2024"
        public decimal Revenue { get; set; }
        public decimal FieldRevenue { get; set; }
        public decimal ServiceRevenue { get; set; }
        public int OrderCount { get; set; }
    }

    /// <summary>
    /// DTO cho tổng doanh thu chủ sân
    /// </summary>
    public class OwnerRevenueDTO
    {
        public int OwnerId { get; set; }
        public string? OwnerName { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalFieldRevenue { get; set; }
        public decimal TotalServiceRevenue { get; set; }
        public int TotalOrders { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<FacilityRevenueDTO> Facilities { get; set; } = new List<FacilityRevenueDTO>();
        public List<TimeRevenueDTO> MonthlyRevenue { get; set; } = new List<TimeRevenueDTO>();
        public List<TimeRevenueDTO> YearlyRevenue { get; set; } = new List<TimeRevenueDTO>();
    }

    /// <summary>
    /// DTO cho request thống kê doanh thu
    /// </summary>
    public class RevenueStatisticsRequestDTO
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? FacilityId { get; set; }
        public string? TimeUnit { get; set; } // "month", "quarter", "year"
    }
}