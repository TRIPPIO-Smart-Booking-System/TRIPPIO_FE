// ============================================================
// IUserService.cs (Interface)
// Location: Trippio.Core/Services/
// Add these methods to your existing IUserService interface
// ============================================================

using Trippio.Core.Domain.Models;

namespace Trippio.Core.Services
{
    public partial interface IUserService
    {
        /// <summary>
        /// Get existing user by email or create new user from Google info
        /// </summary>
        /// <param name="googleUserInfo">User info from Google JWT</param>
        /// <returns>User entity or null if creation failed</returns>
        Task<User?> GetOrCreateGoogleUser(GoogleUserInfo googleUserInfo);

        /// <summary>
        /// Update refresh token for a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="refreshToken">New refresh token</param>
        /// <returns>Task representing async operation</returns>
        Task UpdateRefreshToken(string userId, string refreshToken);

        /// <summary>
        /// Get user by Google ID
        /// </summary>
        /// <param name="googleId">Google Subject ID</param>
        /// <returns>User or null if not found</returns>
        Task<User?> GetByGoogleIdAsync(string googleId);
    }

    /// <summary>
    /// DTO: Google user information from JWT payload
    /// </summary>
    public class GoogleUserInfo
    {
        /// <summary>
        /// User's email address
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's full name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// User's profile picture URL
        /// </summary>
        public string Picture { get; set; } = string.Empty;

        /// <summary>
        /// Google Subject ID (unique identifier from Google)
        /// </summary>
        public string GoogleId { get; set; } = string.Empty;
    }
}
