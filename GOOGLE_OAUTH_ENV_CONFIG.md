# 🔐 Google OAuth2 Environment Configuration - Trippio

## Frontend Configuration

### 1. Client ID Setup

```tsx
// File: src/app/layout-client.tsx
// Already configured with:
clientId = '45013553161-9c1mg1qmk428buh8aqsnvr6uq5bpg6e4.apps.googleusercontent.com';
```

### 2. Required Environment Variables (`.env.local`)

```bash
# For development
NEXT_PUBLIC_API_URL=http://localhost:5000

# For production
NEXT_PUBLIC_API_URL=https://trippio.azurewebsites.net
```

### 3. Vercel Deployment

When deploying to Vercel, add these environment variables in Vercel Dashboard:

- `NEXT_PUBLIC_API_URL` = `https://trippio.azurewebsites.net`

---

## Backend Configuration

### 1. Azure App Service Settings

Go to Azure Portal → App Service → Configuration → Application settings

Add these settings:

```
Authentication:Google:ClientId = 45013553161-9c1mg1qmk428buh8aqsnvr6uq5bpg6e4.apps.googleusercontent.com
Authentication:Google:ClientSecret = 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
Authentication:Google:CallbackPath = /signin-google
```

### 2. Local Development (`appsettings.Development.json`)

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "45013553161-9c1mg1qmk428buh8aqsnvr6uq5bpg6e4.apps.googleusercontent.com",
      "ClientSecret": "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",
      "CallbackPath": "/signin-google"
    }
  }
}
```

### 3. Production (`appsettings.Production.json`)

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "${Authentication:Google:ClientId}",
      "ClientSecret": "${Authentication:Google:ClientSecret}",
      "CallbackPath": "/signin-google"
    }
  }
}
```

---

## Google Cloud Console Setup

### 1. OAuth2 Credentials

- **Client ID**: 45013553161-9c1mg1qmk428buh8aqsnvr6uq5bpg6e4.apps.googleusercontent.com
- **Client Secret**: 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

### 2. Authorized Redirect URIs

Add in Google Cloud Console → Credentials:

```
https://trippio-fe.vercel.app
https://trippio.azurewebsites.net/signin-google
http://localhost:3000 (for local development)
```

### 3. Authorized JavaScript Origins

```
https://trippio-fe.vercel.app
https://trippio.azurewebsites.net
http://localhost:3000 (for local development)
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE LOGIN FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Đăng nhập với Google" button on Frontend
   ↓
2. Google OAuth Modal opens (handled by @react-oauth/google)
   ↓
3. User signs in with Google Account
   ↓
4. Google returns JWT token to Frontend
   ↓
5. Frontend decodes token, shows user info
   ↓
6. Frontend sends token to: POST /api/auth/google-verify
   ↓
7. Frontend Next.js API routes to: POST Backend /api/auth/google-verify
   ↓
8. Backend validates Google JWT signature
   ↓
9. Backend creates/gets user in database
   ↓
10. Backend generates custom JWT token
   ↓
11. Backend returns JWT to Frontend
   ↓
12. Frontend saves accessToken to localStorage
   ↓
13. Frontend redirects to /homepage (or role-based dashboard)
   ↓
14. User is logged in! ✅
```

---

## API Endpoints

### Frontend Endpoint

```
POST /api/auth/google-verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
}

Response:
{
  "isSuccess": true,
  "message": "Google login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_value",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "userName": "username",
    "roles": ["customer"]
  }
}
```

### Backend Endpoint

```
POST /api/auth/google-verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
}

Response: Same as above
```

---

## Testing Checklist

### Local Development

- [ ] `npm install` completed successfully
- [ ] Google Client ID in layout-client.tsx
- [ ] `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
- [ ] Backend running on http://localhost:5000
- [ ] Click Google login button on http://localhost:3000/login
- [ ] See Google OAuth modal
- [ ] Sign in with test Google account
- [ ] Check browser console for token
- [ ] Verify POST /api/auth/google-verify receives token
- [ ] Backend successfully verifies and creates user

### Production (Vercel + Azure)

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Azure App Service
- [ ] Environment variables set in both Vercel and Azure
- [ ] Google Console redirect URI includes https://trippio.azurewebsites.net/signin-google
- [ ] Test login at https://trippio-fe.vercel.app/login
- [ ] Verify user is created in database
- [ ] Check roles are applied correctly
- [ ] Redirect to correct dashboard (admin/staff/customer)

---

## Troubleshooting

### 1. Error: "Google login failed"

**Check:**

- Browser console for error messages
- Network tab → POST /api/auth/google-verify response
- Google Client ID is correct in layout-client.tsx

### 2. Error: "redirect_uri_mismatch"

**Solution:**

- Go to Google Cloud Console
- Verify redirect URI matches exactly: `https://trippio.azurewebsites.net/signin-google`
- Wait 5-30 minutes for Google to propagate changes

### 3. Error: "Token validation failed"

**Check:**

- Google.Apis.Auth NuGet package is installed on backend
- Client ID in backend config matches frontend
- Token hasn't expired

### 4. User not created in database

**Check:**

- Database connection string is correct
- User repository is properly injected
- Check backend logs for errors

### 5. Roles not assigned

**Check:**

- User created with correct role assignment
- Roles returned in JWT token
- Frontend localStorage receives roles

---

## Security Notes

⚠️ **Important:**

1. Never commit `.env.local` with real credentials
2. Use GitHub Secrets for CI/CD pipelines
3. Rotate Google Client Secret periodically
4. Validate tokens server-side
5. Use HTTPS in production
6. Implement rate limiting on auth endpoints
7. Log failed authentication attempts

---

## Support

For issues, check:

1. Backend logs: `Trippio.Api/Logs/`
2. Browser console: F12 → Console tab
3. Network requests: F12 → Network tab
4. Google Cloud Console: https://console.cloud.google.com
