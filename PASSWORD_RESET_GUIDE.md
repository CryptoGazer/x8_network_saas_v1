# Password Reset Implementation Guide

## Overview

The password reset feature has been fully implemented with a secure 3-step verification process using email codes.

## Features Implemented

### Backend (FastAPI)

**New Endpoints in [app/api/v1/auth.py](app/api/v1/auth.py):**

1. **POST /api/v1/auth/request-password-reset**
   - Sends a reset code to the user's email
   - Prevents email enumeration by always returning success
   - Only sends email if user exists

2. **POST /api/v1/auth/verify-reset-code**
   - Verifies the reset code
   - Returns error if code is invalid or expired

3. **POST /api/v1/auth/reset-password**
   - Resets password with verified code
   - Returns JWT tokens for automatic login
   - Updates password in database

**Email Service Updates in [app/services/email.py](app/services/email.py):**

- Added `send_password_reset_email()` function
- Sends password reset codes via SMTP
- Falls back to console logging in development mode
- Uses same verification code infrastructure as registration (10-minute expiration)

### Frontend (React + TypeScript)

**Updated Files:**

1. **[app/frontend/src/pages/AuthPage.tsx](app/frontend/src/pages/AuthPage.tsx)**
   - Implemented 3-step password reset flow
   - Step 1: Enter email → sends reset code
   - Step 2: Enter 6-digit code → verifies code
   - Step 3: Enter new password → resets password and logs in
   - Added success/error messages for each step
   - Auto-redirects to dashboard after successful reset

2. **[app/frontend/src/utils/api.ts](app/frontend/src/utils/api.ts)**
   - Added `requestPasswordReset()` method
   - Added `verifyResetCode()` method
   - Added `resetPassword()` method

3. **[app/frontend/src/context/AuthContext.tsx](app/frontend/src/context/AuthContext.tsx)**
   - Exposed password reset methods to entire app
   - Handles automatic login after password reset

## Password Reset Flow

### User Experience

```
1. User clicks "Forgot password?" on sign-in page
   ↓
2. Enters email address
   ↓
3. Clicks "Send Reset Code"
   ↓
4. Backend sends 6-digit code to email
   ↓
5. User enters code from email
   ↓
6. Clicks "Verify Code"
   ↓
7. Backend validates code (expires in 10 minutes)
   ↓
8. User enters new password (min 6 characters)
   ↓
9. Clicks "Reset Password"
   ↓
10. Backend updates password and returns JWT tokens
    ↓
11. User is automatically logged in and redirected to dashboard
```

### API Flow

```typescript
// Step 1: Request reset code
POST /api/v1/auth/request-password-reset
Body: { email: "user@example.com" }
Response: { message: "If the email exists, a password reset code has been sent", email: "user@example.com" }

// Step 2: Verify code
POST /api/v1/auth/verify-reset-code
Body: { email: "user@example.com", code: "123456" }
Response: { message: "Reset code verified successfully", email: "user@example.com" }

// Step 3: Reset password
POST /api/v1/auth/reset-password
Body: { email: "user@example.com", code: "123456", new_password: "newpassword123" }
Response: { access_token: "...", refresh_token: "...", token_type: "bearer" }
```

## Email Sending Configuration

### Current Setup

The email service is configured to use Gmail SMTP with the following settings in [app/.env](app/.env):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=trqy jhpy myww gugt  # Gmail app password
SMTP_FROM_EMAIL=flowbilling@gmail.com
SMTP_USE_TLS=true
```

### How It Works

The email service has two modes:

#### 1. Development Mode (Console Logging)

When `SMTP_HOST` is "localhost" or not configured:
- Verification codes are printed to console
- No actual emails are sent
- Perfect for local testing

**Example console output:**
```
🔐 PASSWORD RESET CODE FOR: user@example.com
✅ Code: 123456
⏰ Expires in 10 minutes
```

#### 2. Production Mode (Real Emails)

When SMTP is properly configured:
- Real emails are sent via Gmail SMTP
- Uses async email sending (`aiosmtplib`)
- Professional email templates

### Testing Real Email Sending

The current configuration **can send real emails** if the Gmail credentials are valid. Here's how to verify:

#### Option 1: Use Existing Credentials (Recommended)

The `.env` file already has a Gmail app password configured. To test:

1. Start the backend server:
```bash
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

2. Test password reset:
```bash
curl -X POST http://localhost:8000/api/v1/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

3. Check your email inbox for the reset code

#### Option 2: Set Up Your Own Gmail App Password

If the current credentials don't work, create your own:

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other" as the device
   - Name it "x8work"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update `.env` file:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # Remove spaces
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_USE_TLS=true
```

4. **Restart backend server:**
```bash
# Stop the server (Ctrl+C)
uvicorn app.main:app --reload --port 8000
```

### Email Templates

**Password Reset Email:**
```
Subject: Password Reset Code - x8work

Hello,

You requested a password reset for your x8work account.

Your verification code is: 123456

This code will expire in 10 minutes.

If you didn't request this reset, please ignore this email.

Best regards,
The x8work Team
```

**Registration Verification Email:**
```
Subject: Email Verification Code - x8work

Hello,

Thank you for registering with x8work!

Your verification code is: 123456

This code will expire in 10 minutes.

Best regards,
The x8work Team
```

## Security Features

1. **Code Expiration**: All codes expire in 10 minutes
2. **Email Enumeration Prevention**: Always returns success message for password reset requests
3. **Secure Password Hashing**: Uses bcrypt for password hashing
4. **Code Reuse Prevention**: Codes are deleted after successful verification
5. **Automatic Login**: Returns JWT tokens after successful reset

## Testing Checklist

### Backend Endpoints

- [x] `/request-password-reset` - Sends reset code
- [x] `/verify-reset-code` - Verifies code
- [x] `/reset-password` - Resets password and returns tokens

### Frontend UI

- [x] "Forgot password?" button navigates to reset mode
- [x] Step 1: Email input and "Send Reset Code" button
- [x] Step 2: Code input (6 digits, large centered text)
- [x] Step 3: New password input with validation
- [x] Success messages displayed for each step
- [x] Error messages displayed for failures
- [x] "Back to sign in" button resets state
- [x] Auto-redirect to dashboard after successful reset

### Email Service

- [x] Console logging works in development mode
- [ ] Real email sending (requires valid Gmail credentials)
- [ ] Email template looks professional
- [ ] Code expires after 10 minutes

## Troubleshooting

### "Failed to send reset code"

**Check:**
1. Backend server is running
2. Database connection is working
3. SMTP settings in `.env` are correct

**Solution:**
```bash
# Check backend logs
# Terminal running uvicorn will show errors
```

### "Invalid or expired code"

**Causes:**
1. Code expired (10 minutes timeout)
2. Wrong code entered
3. Code already used

**Solution:**
- Request a new code
- Check email for correct code
- Ensure code is entered within 10 minutes

### Emails not sending

**Check:**
1. `SMTP_HOST` is set to `smtp.gmail.com` (not "localhost")
2. `SMTP_USERNAME` is a valid Gmail address
3. `SMTP_PASSWORD` is a valid Gmail app password (not regular password)
4. Gmail 2FA is enabled
5. Backend logs for SMTP errors

**Solution:**
```bash
# Test SMTP connection
python -c "
import smtplib
smtp = smtplib.SMTP('smtp.gmail.com', 587)
smtp.starttls()
smtp.login('your-email@gmail.com', 'your-app-password')
print('✅ SMTP connection successful')
smtp.quit()
"
```

## Current Status

**Implementation:** ✅ COMPLETE

**Backend:** ✅ WORKING
- All endpoints functional
- Email service ready
- Console logging for development

**Frontend:** ✅ WORKING
- Full 3-step UI flow
- Success/error handling
- Auto-login after reset

**Email Sending:** ⚠️ CONFIGURED (Needs Testing)
- SMTP credentials present in `.env`
- Can send real emails if credentials are valid
- Falls back to console logging if SMTP fails

## Next Steps

1. **Test real email sending** with current credentials
2. **Update email templates** if needed (add branding, styling)
3. **Add rate limiting** to prevent abuse (e.g., max 3 reset requests per hour)
4. **Add email verification** for new registrations (infrastructure already exists)
5. **Monitor email logs** for delivery issues

## Files Modified

### Backend
- [app/api/v1/auth.py](app/api/v1/auth.py) - Added 3 password reset endpoints
- [app/services/email.py](app/services/email.py) - Added `send_password_reset_email()`

### Frontend
- [app/frontend/src/pages/AuthPage.tsx](app/frontend/src/pages/AuthPage.tsx) - Implemented reset UI
- [app/frontend/src/utils/api.ts](app/frontend/src/utils/api.ts) - Added API methods
- [app/frontend/src/context/AuthContext.tsx](app/frontend/src/context/AuthContext.tsx) - Added context methods

---

**Date:** December 8, 2025
**Status:** Ready for testing
**Email Capability:** Yes, can send real emails with valid SMTP credentials
