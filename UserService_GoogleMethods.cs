// ============================================================
// UserService.cs (Implementation)
// Location: Trippio.Api/Service/ or Trippio.Core/Services/
// Add these methods to your existing UserService class
// ============================================================

using Trippio.Core.Domain.Models;
using Trippio.Core.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Trippio.Api.Service
{
    public partial class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserService> _logger;
        // ... other dependencies

        /// <summary>
        /// Get existing user by email or create new user from Google info
        /// </summary>
        public async Task<User?> GetOrCreateGoogleUser(GoogleUserInfo googleUserInfo)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(googleUserInfo?.Email))
                {
                    _logger.LogWarning("GoogleUserInfo has no email");
                    return null;
                }

                // ✅ Find existing user by email
                var existingUser = await _userRepository.FirstOrDefaultAsync(
                    u => u.Email.ToLower() == googleUserInfo.Email.ToLower()
                );

                if (existingUser != null)
                {
                    // Update Google ID if not already set
                    if (string.IsNullOrEmpty(existingUser.GoogleId) && !string.IsNullOrEmpty(googleUserInfo.GoogleId))
                    {
                        existingUser.GoogleId = googleUserInfo.GoogleId;
                        existingUser.IsEmailVerified = true;
                        
                        try
                        {
                            await _userRepository.UpdateAsync(existingUser);
                            _logger.LogInformation($"Updated Google ID for existing user: {existingUser.Email}");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error updating Google ID: {ex.Message}");
                            // Continue anyway, user is still valid
                        }
                    }

                    _logger.LogInformation($"Found existing user for Google login: {existingUser.Email}");
                    return existingUser;
                }

                // ✅ Create new user from Google info
                var newUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = googleUserInfo.Email,
                    UserName = ExtractUsernameFromEmail(googleUserInfo.Email),
                    FullName = googleUserInfo.Name ?? googleUserInfo.Email.Split('@')[0],
                    GoogleId = googleUserInfo.GoogleId,
                    IsEmailVerified = true, // Google email is already verified
                    Picture = googleUserInfo.Picture,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true,
                    // Set default role as customer
                    Roles = new List<Role> { new Role { Name = "customer" } }
                };

                await _userRepository.AddAsync(newUser);
                
                _logger.LogInformation($"Created new user from Google login: {newUser.Email}");
                return newUser;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetOrCreateGoogleUser: {ex.Message}", ex);
                return null;
            }
        }

        /// <summary>
        /// Update refresh token for a user
        /// </summary>
        public async Task UpdateRefreshToken(string userId, string refreshToken)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                
                if (user == null)
                {
                    _logger.LogWarning($"User not found for refresh token update: {userId}");
                    return;
                }

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation($"Updated refresh token for user: {user.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating refresh token: {ex.Message}", ex);
                throw;
            }
        }

        /// <summary>
        /// Get user by Google ID
        /// </summary>
        public async Task<User?> GetByGoogleIdAsync(string googleId)
        {
            try
            {
                if (string.IsNullOrEmpty(googleId))
                    return null;

                var user = await _userRepository.FirstOrDefaultAsync(
                    u => u.GoogleId == googleId
                );

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user by Google ID: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Helper: Extract username from email
        /// Example: "john.doe@example.com" → "john.doe"
        /// </summary>
        private string ExtractUsernameFromEmail(string email)
        {
            var localPart = email.Split('@')[0];
            // Remove special characters, replace with underscore
            return System.Text.RegularExpressions.Regex.Replace(
                localPart,
                "[^a-zA-Z0-9_.]",
                "_"
            );
        }
    }
}
