// ============================================================
// GoogleAuthController.cs
// Location: Trippio.Api/Controllers/Auth/
// ============================================================

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using System.Security.Claims;

namespace Trippio.Api.Controllers.Auth
{
    /// <summary>
    /// Google OAuth2 Authentication Controller
    /// Handles Google login, token verification, and user creation
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class GoogleAuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IAuthService _authService;
        private readonly ILogger<GoogleAuthController> _logger;
        private readonly IConfiguration _configuration;

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
        /// Verify Google JWT token from Frontend
        /// Frontend Flow: Google JWT → Validate → Create/Get User → Generate Backend JWT
        /// </summary>
        /// <param name="request">Contains Google JWT token</param>
        /// <returns>User info + Backend JWT access token</returns>
        [HttpPost("google-verify")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleVerify([FromBody] GoogleTokenRequest request)
        {
            try
            {
                // ✅ Validate input
                if (string.IsNullOrWhiteSpace(request?.Token))
                {
                    _logger.LogWarning("Google verify called without token");
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Token không được cung cấp"
                    });
                }

                // ✅ Get Google Client ID from config
                var googleClientId = _configuration["Authentication:Google:ClientId"];
                if (string.IsNullOrEmpty(googleClientId))
                {
                    _logger.LogError("Google Client ID not configured");
                    return StatusCode(500, new
                    {
                        isSuccess = false,
                        message = "Lỗi cấu hình máy chủ"
                    });
                }

                // ✅ Verify Google JWT signature
                GoogleJsonWebSignature.Payload payload;
                try
                {
                    payload = await GoogleJsonWebSignature.ValidateAsync(
                        request.Token,
                        new GoogleJsonWebSignature.ValidationSettings
                        {
                            Audience = new[] { googleClientId }
                        }
                    );
                }
                catch (InvalidOperationException ex)
                {
                    _logger.LogWarning($"Invalid Google token: {ex.Message}");
                    return Unauthorized(new
                    {
                        isSuccess = false,
                        message = "Token Google không hợp lệ"
                    });
                }

                _logger.LogInformation($"Google user verified: {payload.Email}");

                // ✅ Find or create user in database
                var googleUserInfo = new GoogleUserInfo
                {
                    Email = payload.Email ?? "",
                    Name = payload.Name ?? "",
                    Picture = payload.Picture ?? "",
                    GoogleId = payload.Subject ?? ""
                };

                var user = await _userService.GetOrCreateGoogleUser(googleUserInfo);

                if (user == null)
                {
                    _logger.LogError("Failed to create/get user from Google info");
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Không thể tạo tài khoản"
                    });
                }

                // ✅ Generate JWT tokens
                var accessToken = _authService.GenerateJwtToken(user);
                var refreshToken = _authService.GenerateRefreshToken();

                // ✅ Save refresh token to database
                try
                {
                    await _userService.UpdateRefreshToken(user.Id, refreshToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error updating refresh token: {ex.Message}");
                    // Continue anyway, refresh token is optional
                }

                // ✅ Return success response
                _logger.LogInformation($"Google login successful for user: {user.Email}");

                return Ok(new
                {
                    isSuccess = true,
                    message = "Đăng nhập Google thành công",
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
            catch (Exception ex)
            {
                _logger.LogError($"Google verify error: {ex.Message}", ex);
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Lỗi xác thực Google"
                });
            }
        }

        /// <summary>
        /// GET /api/auth/google-login
        /// Initiate Google OAuth flow (server-side flow)
        /// Optional: Use if you prefer server-side redirects
        /// </summary>
        [HttpGet("google-login")]
        [AllowAnonymous]
        public IActionResult GoogleLogin()
        {
            try
            {
                var redirectUrl = Url.Action("GoogleCallback", "GoogleAuth");
                var properties = new AuthenticationProperties
                {
                    RedirectUri = redirectUrl
                };
                return Challenge(properties, "Google");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Google login error: {ex.Message}");
                return BadRequest(new { message = "Failed to initiate Google login" });
            }
        }

        /// <summary>
        /// GET /signin-google
        /// Google OAuth callback endpoint (redirect from Google)
        /// </summary>
        [HttpGet("signin-google")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleCallback()
        {
            try
            {
                // Authenticate with cookie scheme
                var result = await HttpContext.AuthenticateAsync("Cookies");

                if (!result?.Succeeded ?? true)
                {
                    _logger.LogWarning("Google authentication failed");
                    return Redirect("https://trippio-fe.vercel.app/login?error=auth_failed");
                }

                // Extract claims
                var claims = result.Principal?.Identities.FirstOrDefault()?.Claims;
                var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? "";
                var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "";
                var googleId = result.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";

                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("No email found in Google callback");
                    return Redirect("https://trippio-fe.vercel.app/login?error=no_email");
                }

                // Create/get user
                var googleUserInfo = new GoogleUserInfo
                {
                    Email = email,
                    Name = name,
                    GoogleId = googleId
                };

                var user = await _userService.GetOrCreateGoogleUser(googleUserInfo);

                if (user == null)
                {
                    _logger.LogError("Failed to create user in callback");
                    return Redirect("https://trippio-fe.vercel.app/login?error=user_not_created");
                }

                // Generate JWT
                var jwtToken = _authService.GenerateJwtToken(user);

                // Redirect to frontend with token
                _logger.LogInformation($"Google callback successful for: {user.Email}");
                return Redirect($"https://trippio-fe.vercel.app/login-success?token={Uri.EscapeDataString(jwtToken)}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Google callback error: {ex.Message}", ex);
                return Redirect("https://trippio-fe.vercel.app/login?error=callback_failed");
            }
        }
    }

    // ============================================================
    // DTOs
    // ============================================================

    /// <summary>
    /// Request body for Google token verification
    /// </summary>
    public class GoogleTokenRequest
    {
        /// <summary>
        /// JWT token from Google (from frontend)
        /// </summary>
        public string Token { get; set; } = string.Empty;
    }

    /// <summary>
    /// Google user information extracted from JWT
    /// </summary>
    public class GoogleUserInfo
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
        public string GoogleId { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response for Google verification
    /// </summary>
    public class GoogleVerifyResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public UserResponse? User { get; set; }
    }

    public class UserResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}
