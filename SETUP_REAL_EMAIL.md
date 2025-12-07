# Setting Up Real Email Verification

## 🎯 Quick Setup Guide - Gmail (Recommended for Development)

Follow these steps to enable real email sending within 5 minutes:

### Step 1: Enable 2-Factor Authentication on Your Gmail

1. Go to: https://myaccount.google.com/security
2. Under "How you sign in to Google", click **2-Step Verification**
3. Follow the prompts to enable 2FA (required for app passwords)

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. In the "Select app" dropdown, choose **Mail**
3. In the "Select device" dropdown, choose **Other (Custom name)**
4. Type: `X8 Network`
5. Click **Generate**
6. Google will show you a 16-character password
7. **Copy this password** (you won't see it again!)

### Step 3: Update Your .env File

Add these lines to your `.env` file:

```env
# Email/SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_USE_TLS=true
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `your-16-char-app-password` with the app password from Step 2

### Step 4: Restart Backend Server

The server will automatically reload and start sending real emails!

```bash
# If using the startup script, just restart it
./start_dev.sh

# Or manually restart the backend:
# Press Ctrl+C in the backend terminal, then:
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Step 5: Test!

1. Go to http://localhost:5174
2. Register with a **real email address**
3. Check your inbox (and spam folder)
4. You'll receive a beautiful HTML email with your 6-digit code!

---

## 📧 Alternative Email Providers

### Option 2: SendGrid (Free 100 emails/day)

1. Sign up at: https://sendgrid.com (free tier)
2. Create an API key
3. Add to `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=your-verified-sender@yourdomain.com
SMTP_USE_TLS=true
```

### Option 3: Mailgun (Free 5,000 emails/month)

1. Sign up at: https://mailgun.com
2. Verify your domain or use sandbox
3. Get SMTP credentials from dashboard
4. Add to `.env`:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-sandbox.mailgun.org
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM_EMAIL=noreply@your-sandbox.mailgun.org
SMTP_USE_TLS=true
```

### Option 4: AWS SES (Very cheap, highly scalable)

1. Set up AWS SES account
2. Verify your email/domain
3. Get SMTP credentials
4. Add to `.env`:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-aws-access-key
SMTP_PASSWORD=your-aws-secret-key
SMTP_FROM_EMAIL=verified@yourdomain.com
SMTP_USE_TLS=true
```

---

## 🔍 Troubleshooting

### "Authentication failed" error

**Gmail:**
- Make sure 2FA is enabled
- Use App Password, not your regular password
- Check username is your full email address

**Other providers:**
- Verify your API key/password is correct
- Check if your account is verified
- Ensure from_email is verified with the provider

### Emails going to spam

1. **Use a verified domain** (not Gmail for production)
2. **Set up SPF/DKIM records** for your domain
3. **Use a professional email service** (SendGrid, Mailgun, AWS SES)
4. **Warm up your domain** (gradually increase email volume)

### "Connection refused" or "Timeout"

- Check your firewall isn't blocking port 587
- Verify SMTP_HOST and SMTP_PORT are correct
- Try port 465 with SSL if 587 doesn't work

### Still seeing console output instead of emails

- Verify `.env` file is in the correct location (`app/.env`)
- Check SMTP_HOST is NOT "localhost"
- Restart the backend server completely
- Check for typos in variable names

---

## 📝 Example .env Configuration (Gmail)

```env
# Database
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_DB=app
DATABASE_URL=postgresql+asyncpg://app:app@localhost:5432/app
SYNC_DATABASE_URL=postgresql://app:app@localhost:5432/app

# JWT
SECRET_KEY=_dnlqWpgOIHtzhfjblxiwA1W5HZBgUKrqjB51I2dKFw
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
PROJECT_NAME=x8-network
API_V1_PREFIX=/api/v1
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Email/SMTP (Gmail) - ADD THESE LINES
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=myemail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=myemail@gmail.com
SMTP_USE_TLS=true

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

VITE_API_URL=http://127.0.0.1:8000
```

---

## ✅ Verification Checklist

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated and copied
- [ ] SMTP settings added to `.env` file
- [ ] Backend server restarted
- [ ] Test email sent successfully
- [ ] Email received (check spam folder)

---

## 🎨 What the Email Looks Like

Your users will receive a beautifully designed HTML email with:

- X8 Network branding with gradient header
- Clear 6-digit verification code in large font
- Monospace font for the code (easy to read)
- Professional styling with cyan/teal gradient colors
- Mobile-responsive design
- Expiration notice (10 minutes)
- Security message

---

## 🚀 Production Recommendations

For production, we recommend:

1. **Use a dedicated email service** (not Gmail)
   - SendGrid, Mailgun, or AWS SES
   - Better deliverability
   - Higher sending limits
   - Detailed analytics

2. **Set up a custom domain**
   - e.g., `noreply@x8work.com`
   - Improves trust and deliverability
   - Required for SPF/DKIM/DMARC

3. **Configure SPF/DKIM/DMARC records**
   - Prevents emails going to spam
   - Verifies your domain ownership
   - Most email services provide these

4. **Monitor email delivery**
   - Track open rates
   - Monitor bounce rates
   - Set up alerts for failures

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all credentials are correct
3. Try a different email provider
4. Check backend logs for error messages

**Gmail is the fastest way to get started - follow Steps 1-4 above and you'll have real email verification in under 5 minutes!**
