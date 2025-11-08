using SportZone_API.Services.Interfaces;

namespace SportZone_API.Services
{
    public class FileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;

        public FileStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string?> UploadFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            // Tạo đường dẫn thư mục uploads bên trong wwwroot
            var uploadPath = Path.Combine(_env.WebRootPath, "uploads", folderName);
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            // Tạo tên file duy nhất để tránh trùng lặp
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadPath, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về URL tương đối để truy cập file
            return $"/uploads/{folderName}/{uniqueFileName}";
        }

        public bool DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                return false;
            }

            // Chuyển đổi URL tương đối thành đường dẫn vật lý
            var localPath = Path.Combine(_env.WebRootPath, fileUrl.TrimStart('/'));

            if (File.Exists(localPath))
            {
                File.Delete(localPath);
                return true;
            }
            return false;
        }
    }
}