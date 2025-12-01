# Gmail SMTP Email Setup Guide

## Issue
Gmail requires **App Passwords** for SMTP authentication. Regular passwords won't work.

## Solution: Generate Gmail App Password

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Complete the setup process

### Step 2: Generate App Password
1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter name: "infodocs API"
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Update your `.env` file with the App Password:

```env
SMTP_USER=info.dishaonlinesoution@gmail.com
SMTP_PASSWORD=your-16-character-app-password-here
```

**Important:**
- Use the App Password (16 characters with spaces or without spaces - both work)
- Do NOT use your regular Gmail password
- Remove spaces if you prefer: `abcdefghijklmnop`

### Step 4: Restart the Server
After updating the `.env` file, restart your FastAPI server for changes to take effect.

## Troubleshooting

### Error: "Username and Password not accepted"
- Make sure 2-Step Verification is enabled
- Verify you're using an App Password, not your regular password
- Check that the email address is correct (note: there's a typo "dishaonlinesoution" - missing 'l')

### Error: "Connection timeout"
- Check firewall settings
- Verify SMTP_HOST=smtp.gmail.com and SMTP_PORT=587
- Ensure SMTP_USE_TLS=True

### Still Not Working?
1. Generate a new App Password
2. Make sure there are no extra spaces in the password
3. Try removing spaces from the App Password
4. Verify the email account is active and accessible

