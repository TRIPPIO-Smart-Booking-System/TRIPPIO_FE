# 🧪 Google OAuth Testing Guide - Trippio

## Environment Setup

### 1. Frontend (.env.local)

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=45013553161-9c1mg1qmk428buh8aqsnvr6uq5bpg6e4.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Backend (appsettings.Development.json)

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "45013553161-9c1mg1qmk428buh8aqsnvr6uq5bpg6e4.apps.googleusercontent.com",
      "ClientSecret": "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"
    }
  }
}
```

---

## Testing Steps

### Step 1: Start Backend

```bash
cd d:\Ki7fpt\Exe201\TripioBE\Trippio-main\src
dotnet run --project Trippio.Api/Trippio.Api.csproj
# Should start on http://localhost:5000
```

### Step 2: Start Frontend

```bash
cd d:\Ki7fpt\TRIPPIO_FE
npm run dev
# Should start on http://localhost:3000
```

### Step 3: Test Google Login

1. Go to http://localhost:3000/login
2. Click "Đăng nhập với Google" button
3. Select a Google account (use test account: trippio.test.vn@gmail.com or any Google account)
4. Accept permissions
5. Should redirect to homepage with success toast

### Step 4: Verify User Created/Updated in Database

```bash
# Check backend logs for:
# ✅ Google user verified: user@gmail.com
# ✅ Created new user from Google: user@gmail.com, GoogleId: 1234567890
# OR
# ✅ Updated existing user with Google info: user@gmail.com, GoogleId: 1234567890

# Query database to verify:
SELECT Id, Email, GoogleId, Picture, OAuthProvider, IsEmailVerified, IsActive
FROM AppUsers
WHERE GoogleId IS NOT NULL
ORDER BY DateCreated DESC;
```

### Step 5: Verify User Count Increases

```bash
# Using the API endpoint:
GET http://localhost:5000/api/admin/user/paging
# (Requires Authorization header with admin JWT)

# Or check database:
SELECT COUNT(*) as UserCount FROM AppUsers WHERE IsActive = 1;
```

---

## Expected Behavior

✅ **On First Google Login:**

- User created in database
- GoogleId saved
- Picture downloaded if available
- OAuthProvider = "google"
- IsEmailVerified = true
- Default role "customer" assigned
- LastLoginDate recorded
- Redirect to /homepage

✅ **On Subsequent Google Login (same email):**

- User found in database
- GoogleId, Picture, IsEmailVerified updated if needed
- LastLoginDate updated
- Roles preserved
- Redirect to /homepage

✅ **User Count:**

- First Google login: user count +1
- Existing email Google login: user count stays same

---

## API Endpoints

### FE Proxy Route

```
POST /api/auth/google-verify
Content-Type: application/json

Request:
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
}

Response (Success):
{
  "isSuccess": true,
  "message": "Đăng nhập Google thành công",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "base64_encoded_refresh_token",
  "user": {
    "id": "guid-uuid",
    "email": "user@gmail.com",
    "userName": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "roles": ["customer"]
  }
}
```

### Backend Endpoint

```
POST /api/auth/google-verify
Content-Type: application/json
Authorization: Not required

Request:
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9..."
}

Response: Same as FE proxy route
```

---

## Common Issues & Solutions

### ❌ Error 500 on POST /api/auth/google-verify

**Cause:** Backend not configured or unreachable

**Solutions:**

1. Check if backend is running: `curl http://localhost:5000`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local` is correct
3. Check backend logs for detailed error
4. Ensure `Authentication:Google:ClientId` is set in appsettings

### ❌ "Token Google không hợp lệ"

**Cause:** Client ID mismatch or expired token

**Solutions:**

1. Verify Client ID matches in both FE and Backend configs
2. Token might be expired (Google tokens expire in ~10 minutes)
3. Try again by clicking button

### ❌ User not created

**Cause:** CreateAsync failed (validation error) or no role "customer"

**Solutions:**

1. Check backend logs for error: `Failed to create user: ...`
2. Ensure "customer" role exists in database:
   ```sql
   SELECT * FROM AspNetRoles WHERE Name = 'customer';
   ```
3. If not exists, create it:
   ```sql
   INSERT INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp)
   VALUES (NEWID(), 'customer', 'CUSTOMER', NEWID());
   ```

### ❌ GoogleId not saved in database

**Cause:** Update after create didn't execute properly

**Solutions:**

1. Check if `AppUser` model has `GoogleId` property
2. Run migration if not: `dotnet ef database update`
3. Manually verify in logs: `GoogleId: user.GoogleId`

---

## Browser Console Debugging

Open F12 → Console tab and look for:

```javascript
// Should see:
'[FE API Route] Forwarding to: http://localhost:5000/api/auth/google-verify';
'[FE API Route] Backend success, user: user@gmail.com';

// If error:
'[FE API Route] Backend error: 500 ...';
'[FE API Route] Exception: ...';
```

---

## Network Debugging

Open F12 → Network tab:

1. **POST /api/auth/google-verify** (FE proxy)
   - Status: 200 OK
   - Response: Has accessToken, user data

2. **POST /api/auth/google-verify** (Backend)
   - Status: 200 OK
   - Request headers: Content-Type: application/json
   - Request body: { token: "..." }

---

## Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and loads login page
- [ ] Google button is visible and clickable
- [ ] Google modal opens when button clicked
- [ ] Can sign in with Google account
- [ ] See success toast message
- [ ] Redirected to homepage
- [ ] localStorage has accessToken, userId
- [ ] Backend logs show user created/updated
- [ ] Database shows GoogleId filled for user
- [ ] User count increased by 1

---

## Next Steps

Once Google login works:

1. Test role-based redirect (admin/staff vs customer)
2. Test refresh token functionality
3. Test logout and re-login
4. Test with existing email (should update not recreate)
5. Deploy to Vercel/Azure and test again
