# OAuth Setup Guide - X8 Network SaaS

This guide will walk you through setting up OAuth authentication with Google, Facebook, and Apple.

## Overview

The application now supports three OAuth providers:
- **Google OAuth 2.0** - Continue with Google
- **Facebook Login** - Continue with Facebook
- **Apple Sign In** - Continue with Apple

Additionally, traditional email/password authentication works for registration and login.

## Prerequisites

1. Backend server running on `http://localhost:8000`
2. Frontend server running on `http://localhost:5173`
3. Valid domain or localhost for testing

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**

### Step 2: Configure OAuth Consent Screen

1. Click **OAuth consent screen** in the left sidebar
2. Choose **External** user type (or Internal if using Google Workspace)
3. Fill in required fields:
   - App name: `x8work`
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
   - `openid`
5. Save and continue

### Step 3: Create OAuth 2.0 Credentials

1. Go to **Credentials** tab
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Name: `x8work Web Client`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:8000
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:8000/api/v1/oauth/google/callback
   http://localhost:5173/auth/callback
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### Step 4: Add to Environment Variables

Edit `app/.env`:
```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## 2. Facebook Login Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** app type
4. Fill in app details:
   - App name: `x8work`
   - App contact email: your email
5. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **Facebook Login**
2. Click **Set Up**
3. Choose **Web** platform
4. Enter Site URL: `http://localhost:5173`
5. Save changes

### Step 3: Configure Facebook Login Settings

1. Go to **Products** > **Facebook Login** > **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:8000/api/v1/oauth/facebook/callback
   http://localhost:5173/auth/callback
   ```
3. Save changes

### Step 4: Get App Credentials

1. Go to **Settings** > **Basic**
2. Copy **App ID** (this is your Client ID)
3. Click **Show** next to **App Secret** and copy it

### Step 5: Make App Live

1. In the top bar, toggle the app from **Development** to **Live**
2. You may need to complete additional verification steps

### Step 6: Add to Environment Variables

Edit `app/.env`:
```bash
FACEBOOK_CLIENT_ID=your-app-id-here
FACEBOOK_CLIENT_SECRET=your-app-secret-here
```

---

## 3. Apple Sign In Setup

### Step 1: Join Apple Developer Program

1. You need an active [Apple Developer](https://developer.apple.com/) account ($99/year)
2. Sign in to your account

### Step 2: Create App ID

1. Go to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** > **+** button
3. Select **App IDs** > **Continue**
4. Choose **App** > **Continue**
5. Fill in:
   - Description: `x8work`
   - Bundle ID: `com.x8work.app` (or your domain)
6. Under **Capabilities**, enable **Sign in with Apple**
7. Click **Continue** > **Register**

### Step 3: Create Services ID

1. Go back to **Identifiers** > **+** button
2. Select **Services IDs** > **Continue**
3. Fill in:
   - Description: `x8work Web Service`
   - Identifier: `com.x8work.web` (must be different from App ID)
4. Enable **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple
6. Select your primary App ID
7. Add **Web Domain**: `localhost` (for production use your domain)
8. Add **Return URLs**:
   ```
   http://localhost:5173/auth/callback
   ```
9. Click **Save** > **Continue** > **Register**

### Step 4: Create Key for Sign in with Apple

1. Go to **Keys** > **+** button
2. Key Name: `x8work Sign in with Apple Key`
3. Enable **Sign in with Apple**
4. Click **Configure**
5. Select your primary App ID
6. Click **Save** > **Continue** > **Register**
7. **Download the .p8 key file** (you can only download once!)
8. Note the **Key ID** shown

### Step 5: Add to Environment Variables

Edit `app/.env`:
```bash
APPLE_CLIENT_ID=com.x8work.web
APPLE_TEAM_ID=your-team-id-here
APPLE_KEY_ID=your-key-id-here
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key content here\n-----END PRIVATE KEY-----
```

**To get your Team ID:**
1. Go to [Apple Developer Account](https://developer.apple.com/account/)
2. Look for **Team ID** in the top right corner

**To format the private key:**
```bash
# Replace newlines with \n
cat AuthKey_XXXXX.p8 | awk '{printf "%s\\n", $0}'
```

---

## Testing OAuth Flows

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd /Users/cryptogazer/Desktop/PABLO/Freelance/WebApps/X8_Network_SaaS/x8_network_saas_v1
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/cryptogazer/Desktop/PABLO/Freelance/WebApps/X8_Network_SaaS/x8_network_saas_v1/app/frontend
npm run dev
```

### 2. Test Authentication

1. Open `http://localhost:5173`
2. You should see the new auth page with:
   - OAuth provider buttons (Google, Apple, Facebook)
   - Email/password form for signup/signin
3. Try each authentication method:

   **Email Registration:**
   - Click "Sign up"
   - Enter full name, email, and password (min 6 characters)
   - Click "Sign Up" button
   - Should redirect to dashboard

   **Email Login:**
   - Enter email and password
   - Click "Sign In" button
   - Should redirect to dashboard

   **Google OAuth:**
   - Click "Continue with Google"
   - Redirects to Google login
   - After approval, redirects back to your app
   - Should create account and login

   **Facebook OAuth:**
   - Click "Continue with Facebook"
   - Redirects to Facebook login
   - After approval, redirects back to your app
   - Should create account and login

   **Apple OAuth:**
   - Click "Continue with Apple"
   - Redirects to Apple login
   - After approval, redirects back to your app
   - Should create account and login

---

## Troubleshooting

### Google OAuth Issues

**Error: redirect_uri_mismatch**
- Check that your redirect URI in Google Console exactly matches:
  `http://localhost:8000/api/v1/oauth/google/callback`
- Check authorized JavaScript origins include `http://localhost:5173`

**Error: access_denied**
- Make sure OAuth consent screen is configured
- Check that required scopes are added (email, profile, openid)

### Facebook OAuth Issues

**Error: URL Blocked**
- Add the redirect URI to Valid OAuth Redirect URIs in Facebook Login settings
- Make sure the Facebook app is in "Live" mode (not Development)

**Error: App Not Set Up**
- Verify Facebook Login product is added to your app
- Check that your App ID and App Secret are correct

### Apple OAuth Issues

**Error: invalid_client**
- Verify your Services ID is correctly configured
- Check that the Bundle ID matches what's in your .env file
- Ensure the private key is properly formatted with `\n` for newlines

**Error: invalid_request**
- Make sure the redirect URI in Apple Services ID matches `http://localhost:5173/auth/callback`
- Verify your Team ID and Key ID are correct

### General Issues

**CORS Errors:**
- Check `BACKEND_CORS_ORIGINS` in `app/.env` includes:
  ```
  BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]
  ```

**Backend Not Starting:**
```bash
# Install missing dependencies
source .venv/bin/activate
pip install authlib httpx python-jose[cryptography]
```

**Frontend Not Starting:**
```bash
cd app/frontend
npm install react-router-dom
npm install
```

---

## Production Deployment

When deploying to production:

### 1. Update URLs

**Backend `.env`:**
```bash
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
BACKEND_CORS_ORIGINS=["https://your-domain.com"]
```

**Frontend `.env`:**
```bash
VITE_API_URL=https://api.your-domain.com
```

### 2. Update OAuth Redirect URIs

For each OAuth provider, add production redirect URIs:

**Google:**
- Authorized JavaScript origins: `https://your-domain.com`, `https://api.your-domain.com`
- Authorized redirect URIs: `https://api.your-domain.com/api/v1/oauth/google/callback`, `https://your-domain.com/auth/callback`

**Facebook:**
- Valid OAuth Redirect URIs: `https://api.your-domain.com/api/v1/oauth/facebook/callback`, `https://your-domain.com/auth/callback`
- Site URL: `https://your-domain.com`

**Apple:**
- Web Domain: `your-domain.com`
- Return URLs: `https://your-domain.com/auth/callback`

### 3. Update Services ID

Update Apple Services ID to use your production domain instead of `localhost`.

---

## Security Best Practices

1. **Never commit OAuth credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** in production
4. **Rotate secrets** regularly
5. **Monitor OAuth logs** for suspicious activity
6. **Implement rate limiting** on auth endpoints
7. **Use secure session management**

---

## File Structure

```
app/
├── api/v1/
│   ├── auth.py           # Email auth endpoints
│   └── oauth.py          # OAuth endpoints (NEW)
├── services/
│   ├── auth.py           # Auth business logic
│   └── oauth.py          # OAuth handlers (NEW)
├── core/
│   └── config.py         # OAuth settings added
└── .env                  # OAuth credentials

frontend/src/
├── pages/
│   ├── AuthPage.tsx      # New auth UI (NEW)
│   └── OAuthCallback.tsx # OAuth callback handler (NEW)
├── components/
│   └── NeuralBackground.tsx # Animated background (NEW)
├── context/
│   └── AuthContext.tsx   # Auth state management (NEW)
├── App.tsx               # Router setup (UPDATED)
└── main.tsx              # App initialization (UPDATED)
```

---

## Support

For issues or questions:
1. Check backend logs: Terminal running `uvicorn`
2. Check frontend console: Browser DevTools (F12)
3. Check OAuth provider dashboards for error messages
4. Review this guide's troubleshooting section

---

**Status**: ✅ READY FOR TESTING
**Last Updated**: December 8, 2025
