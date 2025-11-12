// ============================================================
// User.cs (Domain Model)
// Location: Trippio.Core/Domain/Models/
// Add these properties to your existing User class
// ============================================================

namespace Trippio.Core.Domain.Models
{
    public class User : BaseEntity
    {
        // ... existing properties ...

        // ============================================================
        // ✨ ADD THESE PROPERTIES FOR GOOGLE OAUTH
        // ============================================================

        /// <summary>
        /// Google Subject ID (unique identifier from Google)
        /// Used to link user account with Google profile
        /// </summary>
        public string GoogleId { get; set; } = string.Empty;

        /// <summary>
        /// Refresh token for JWT
        /// Used to generate new access tokens without re-authentication
        /// </summary>
        public string RefreshToken { get; set; } = string.Empty;

        /// <summary>
        /// Refresh token expiration time (UTC)
        /// Typically 7 days from creation
        /// </summary>
        public DateTime? RefreshTokenExpiryTime { get; set; }

        /// <summary>
        /// Email verification status
        /// For Google OAuth, set to true automatically
        /// </summary>
        public bool IsEmailVerified { get; set; } = false;

        /// <summary>
        /// User's profile picture URL (from Google)
        /// </summary>
        public string Picture { get; set; } = string.Empty;

        /// <summary>
        /// Last login timestamp
        /// Useful for tracking user activity
        /// </summary>
        public DateTime? LastLoginAt { get; set; }

        /// <summary>
        /// OAuth provider (e.g., "google", "facebook")
        /// Can be extended for multiple OAuth providers
        /// </summary>
        public string OAuthProvider { get; set; } = "google"; // "google", "facebook", etc.

        // ============================================================
        // END GOOGLE OAUTH PROPERTIES
        // ============================================================
    }
}

// ============================================================
// MIGRATION INSTRUCTIONS
// ============================================================
/*
If using Entity Framework Core, create a migration to add these columns:

1. Open Package Manager Console
2. Run: Add-Migration AddGoogleOAuthToUser
3. Review the generated migration file
4. Run: Update-Database

Or execute this SQL manually (adjust table/column names as needed):

ALTER TABLE [Users] ADD 
    [GoogleId] NVARCHAR(255) NULL,
    [RefreshToken] NVARCHAR(MAX) NULL,
    [RefreshTokenExpiryTime] DATETIME2 NULL,
    [IsEmailVerified] BIT NOT NULL DEFAULT 0,
    [Picture] NVARCHAR(MAX) NULL,
    [LastLoginAt] DATETIME2 NULL,
    [OAuthProvider] NVARCHAR(50) NOT NULL DEFAULT 'google';

-- Add unique index for GoogleId (optional but recommended)
CREATE UNIQUE INDEX [IX_Users_GoogleId] 
ON [Users] ([GoogleId]) 
WHERE [GoogleId] IS NOT NULL;
*/
