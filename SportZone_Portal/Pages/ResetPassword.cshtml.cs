using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SportZone_API.Pages
{
    public class ResetPasswordModel : PageModel
    {
        private readonly IHttpClientFactory _clientFactory;

        public ResetPasswordModel(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public class InputModel
        {
            [Required]
            public string Email { get; set; }

            [Required]
            public string Code { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 10)]
            [DataType(DataType.Password)]
            public string Password { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirm password")]
            [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
            public string ConfirmPassword { get; set; }
        }

        public IActionResult OnGet(string email)
        {
            Input = new InputModel
            {
                Email = email
            };
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (ModelState.IsValid)
            {
                var client = _clientFactory.CreateClient();
                var requestData = new
                {
                    code = Input.Code,
                    newPassword = Input.Password,
                    confirmPassword = Input.ConfirmPassword
                };
                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://localhost:7057/api/ForgotPassword/verify-code", content);

                if (response.IsSuccessStatusCode)
                {
                    return RedirectToPage("./ResetPasswordConfirmation");
                }
                else
                {
                    ModelState.AddModelError(string.Empty, "An error occurred.");
                    return Page();
                }
            }

            return Page();
        }
    }
}
