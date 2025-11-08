using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SportZone_API.Pages
{
    public class ForgotPasswordModel : PageModel
    {
        private readonly IHttpClientFactory _clientFactory;

        public ForgotPasswordModel(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public class InputModel
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; }
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (ModelState.IsValid)
            {
                var client = _clientFactory.CreateClient();
                var requestData = new { email = Input.Email };
                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://localhost:7057/api/ForgotPassword/send-code", content);

                if (response.IsSuccessStatusCode)
                {
                    return RedirectToPage("./ResetPassword", new { email = Input.Email });
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
