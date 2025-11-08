
﻿using System.ComponentModel.DataAnnotations;

using Microsoft.AspNetCore.Http;
using System.Collections.Generic;


namespace SportZone_API.DTOs
{
    public class FacilityDto
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? CloseTime { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? Subdescription { get; set; }

        public List<IFormFile>? Images { get; set; }
    }

    public class FacilityUpdateDto
    {
        [Required(ErrorMessage = "User ID là bắt buộc.")]
        public int UserId { get; set; }
        public string? Name { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? CloseTime { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? Subdescription { get; set; }
        public List<string>? ExistingImageUrls { get; set; }
        public List<IFormFile>? NewImages { get; set; }
    }


    public class FacilityDetailDto
    {
        public int FacId { get; set; }
        public int UserId { get; set; }
        public string? Name { get; set; }
        public TimeOnly? OpenTime { get; set; }
        public TimeOnly? CloseTime { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? Subdescription { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
        public List<CategoryFieldDto> CategoryFields { get; set; } = new List<CategoryFieldDto>();
    }

    
}



