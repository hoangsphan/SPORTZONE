namespace SportZone_API.DTOs
{
    public class SearchUserDto
    {
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Status { get; set; }
        public int? RoleId { get; set; }
    }
} 