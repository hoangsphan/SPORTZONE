using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SportZone_API.Helpers
{
    public static class ImageUpload
    {
        private static readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

        public static (bool isValid, string errorMessage) ValidateImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return (false, "File ảnh không được rỗng.");
            }

            // Kiểm tra dung lượng
            if (image.Length > MaxFileSize)
            {
                return (false, $"File '{image.FileName}' vượt quá dung lượng tối đa 5MB.");
            }

            // Kiểm tra định dạng
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
            {
                return (false, $"Định dạng file '{image.FileName}' không hợp lệ. Chỉ chấp nhận: {string.Join(", ", _allowedExtensions)}.");
            }

            return (true, string.Empty);
        }

        // Sửa đổi phương thức để nhận thêm tham số subFolder
        public static async Task<string?> SaveImageAsync(IFormFile image, string wwwrootPath, string subFolder)
        {
            try
            {
                // Tạo tên file duy nhất
                var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
                var fileName = Guid.NewGuid().ToString() + extension;

                // Sử dụng tham số subFolder để tạo đường dẫn
                var uploadPath = Path.Combine(wwwrootPath, subFolder);
                var filePath = Path.Combine(uploadPath, fileName);

                // Đảm bảo thư mục tồn tại
                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                // Lưu file
                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Trả về đường dẫn tương đối
                return $"/{subFolder}/{fileName}";
            }
            catch
            {
                return null;
            }
        }
        public static void DeleteImage(string imageUrl, string wwwrootPath)
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                return;
            }

            var pathToDelete = Path.Combine(wwwrootPath, imageUrl.TrimStart('/'));
            if (File.Exists(pathToDelete))
            {
                File.Delete(pathToDelete);
            }
        }
    }
}