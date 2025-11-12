/\*\*

- GOOGLE LOGIN - BACKEND SETUP GUIDE (ASP.NET Core)
-
- 📍 Location: Trippio.Api project
- 🎯 Objective: Setup Google OAuth2 authentication + create endpoints for Google login
  \*/

// ============================================================
// 1. UPDATE: appsettings.Production.json
// ============================================================
// Add this section to your appsettings.Production.json:

/_
{
"Authentication": {
"Google": {
"ClientId": "45013553161-9c1mg1qmk428buh8aqsnvr6uq5bpg6e4.apps.googleusercontent.com",
"ClientSecret": "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",
"CallbackPath": "/signin-google"
}
}
}
_/

// ============================================================
// 2. UPDATE: Program.cs
// ============================================================
// Add Google Authentication to builder.Services:

/_
// Add after existing authentication setup
builder.Services.AddAuthentication(options =>
{
options.DefaultScheme = "Cookies";
options.DefaultChallengeScheme = "Google";
})
.AddCookie("Cookies", options =>
{
options.LoginPath = "/login";
options.LogoutPath = "/logout";
options.AccessDeniedPath = "/access-denied";
})
.AddGoogle(googleOptions =>
{
googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"]
?? throw new InvalidOperationException("Google ClientId not configured");
googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
?? throw new InvalidOperationException("Google ClientSecret not configured");
googleOptions.CallbackPath = new PathString(
builder.Configuration["Authentication:Google:CallbackPath"] ?? "/signin-google"
);
});
_/

// ============================================================
// 3. CREATE: Controllers/Auth/GoogleAuthController.cs
// ============================================================
// Full controller code:

/\*
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using System.Security.Claims;
using Trippio.Api.Controllers.Models;
using Trippio.Core.Services;
using Trippio.Core.Domain.Models;

namespace Trippio.Api.Controllers.Auth
{
[ApiController]
[Route("api/auth")]
public class GoogleAuthController : ControllerBase
{
private readonly IUserService \_userService;
private readonly IAuthService \_authService;
private readonly ILogger<GoogleAuthController> \_logger;
private readonly IConfiguration \_configuration;

        public GoogleAuthController(
            IUserService userService,
            IAuthService authService,
            ILogger<GoogleAuthController> logger,
            IConfiguration configuration)
        {
            _userService = userService;
            _authService = authService;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// POST /api/auth/google-verify
        /// Verify Google JWT token from Frontend, create/get user, return JWT
        /// </summary>
        [HttpPost("google-verify")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleVerify([FromBody] GoogleTokenRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.Token))
                    return BadRequest(new { isSuccess = false, message = "Token not provided" });

                // Verify Google JWT signature
                var payload = await GoogleJsonWebSignature.ValidateAsync(
                    request.Token,
                    new GoogleJsonWebSignature.ValidationSettings()
                    {
                        Audience = new[] { _configuration["Authentication:Google:ClientId"] }
                    }
                );

                _logger.LogInformation($"Google user verified: {payload.Email}");

                // Find or create user in database
                var user = await _userService.GetOrCreateGoogleUser(new GoogleUserInfo
                {
                    Email = payload.Email,
                    Name = payload.Name,
                    Picture = payload.Picture,
                    GoogleId = payload.Subject
                });

                if (user == null)
                {
                    _logger.LogError("Failed to create/get user from Google info");
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Không thể tạo tài khoản"
                    });
                }

                // Generate JWT token
                var accessToken = _authService.GenerateJwtToken(user);
                var refreshToken = _authService.GenerateRefreshToken();

                // Update refresh token in database
                await _userService.UpdateRefreshToken(user.Id, refreshToken);

                return Ok(new
                {
                    isSuccess = true,
                    message = "Google login successful",
                    accessToken = accessToken,
                    refreshToken = refreshToken,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        userName = user.UserName,
                        roles = user.Roles?.Select(r => r.Name).ToList() ?? new List<string>()
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError($"Invalid Google token: {ex.Message}");
                return Unauthorized(new { isSuccess = false, message = "Token không hợp lệ" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Google auth error: {ex.Message}");
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Lỗi xác thực Google"
                });
            }
        }

        /// <summary>
        /// GET /api/auth/google-login
        /// Initiate Google OAuth flow (optional - for server-side flow)
        /// </summary>
        [HttpGet("google-login")]
        [AllowAnonymous]
        public IActionResult GoogleLogin()
        {
            var redirectUrl = Url.Action("GoogleCallback", "GoogleAuth");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, "Google");
        }

        /// <summary>
        /// GET /signin-google
        /// Google OAuth callback endpoint
        /// </summary>
        [HttpGet("signin-google")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleCallback()
        {
            try
            {
                var result = await HttpContext.AuthenticateAsync("Cookies");
                if (!result.Succeeded)
                    return Redirect("https://trippio-fe.vercel.app/login?error=auth_failed");

                var claims = result.Principal?.Identities.FirstOrDefault()?.Claims;
                var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
                var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

                // Lấy token từ result nếu có
                var accessToken = result.Properties?.GetTokenValue("access_token");

                // Create user & generate JWT
                var user = await _userService.GetOrCreateGoogleUser(new GoogleUserInfo
                {
                    Email = email ?? "",
                    Name = name ?? "",
                    GoogleId = result.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? ""
                });

                if (user != null)
                {
                    var jwtToken = _authService.GenerateJwtToken(user);
                    return Redirect($"https://trippio-fe.vercel.app/login-success?token={jwtToken}");
                }

                return Redirect("https://trippio-fe.vercel.app/login?error=user_not_created");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Google callback error: {ex.Message}");
                return Redirect("https://trippio-fe.vercel.app/login?error=callback_failed");
            }
        }
    }

    // DTO Classes
    public class GoogleTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }

    public class GoogleUserInfo
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
        public string GoogleId { get; set; } = string.Empty;
    }

}
\*/

// ============================================================
// 4. UPDATE: IUserService.cs (Interface)
// ============================================================
// Add method to interface:

/_
Task<User> GetOrCreateGoogleUser(GoogleUserInfo googleUserInfo);
Task UpdateRefreshToken(string userId, string refreshToken);
_/

// ============================================================
// 5. UPDATE: UserService.cs (Implementation)
// ============================================================
// Add implementation:

/\*
public async Task<User> GetOrCreateGoogleUser(GoogleUserInfo googleUserInfo)
{
try
{
// Find user by email
var user = await \_userRepository.FirstOrDefaultAsync(u => u.Email == googleUserInfo.Email);

        if (user != null)
        {
            // Update Google ID if not set
            if (string.IsNullOrEmpty(user.GoogleId))
            {
                user.GoogleId = googleUserInfo.GoogleId;
                user.IsEmailVerified = true;
                await _userRepository.UpdateAsync(user);
            }
            return user;
        }

        // Create new user
        user = new User
        {
            Email = googleUserInfo.Email,
            UserName = googleUserInfo.Email.Split('@')[0],
            FullName = googleUserInfo.Name,
            GoogleId = googleUserInfo.GoogleId,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        return user;
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error creating/getting Google user: {ex.Message}");
        return null;
    }

}

public async Task UpdateRefreshToken(string userId, string refreshToken)
{
var user = await \_userRepository.GetByIdAsync(userId);
if (user != null)
{
user.RefreshToken = refreshToken;
user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
await \_userRepository.UpdateAsync(user);
}
}
\*/

// ============================================================
// 6. UPDATE: User Model (Domain)
// ============================================================
// Add fields to User entity:

/_
public string GoogleId { get; set; } = string.Empty;
public string RefreshToken { get; set; } = string.Empty;
public DateTime? RefreshTokenExpiryTime { get; set; }
public bool IsEmailVerified { get; set; } = false;
_/

// ============================================================
// 7. INSTALL NuGet Package
// ============================================================
// Run in Visual Studio Package Manager Console:
// Install-Package Google.Apis.Auth

// ============================================================
// 8. DEPLOYMENT CHECKLIST
// ============================================================
// ✅ Add Google OAuth credentials to Azure Key Vault or App Configuration
// ✅ Update appsettings.Production.json with env variables
// ✅ Verify redirect URI: https://trippio.azurewebsites.net/signin-google
// ✅ Test locally with ngrok (if needed)
// ✅ Deploy to Azure
// ✅ Wait 5-30 minutes for Google to propagate changes
// ✅ Test in production

// ============================================================
// 9. TESTING
// ============================================================
// Frontend URL: https://trippio-fe.vercel.app
// Callback URL: https://trippio.azurewebsites.net/signin-google
// Token Verification: POST https://trippio.azurewebsites.net/api/auth/google-verify

// ============================================================
// 10. TROUBLESHOOTING
// ============================================================
//
// ❌ redirect_uri_mismatch
// → Check Google Console redirect URI matches exactly
// → Verify HTTPS is being used
//
// ❌ Invalid Client ID
// → Verify credentials in appsettings.Production.json
// → Check Authorization header in requests
//
// ❌ Token validation fails
// → Ensure Google.Apis.Auth package is installed
// → Check token hasn't expired
// → Verify audience (client ID) matches
//
