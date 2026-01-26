# Google OAuth Authentication Setup Guide

## Overview
This application uses Supabase Auth with Google OAuth for secure admin authentication. Only whitelisted email addresses can access the admin panel.

## Setup Steps

### 1. Enable Google OAuth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**

### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: Your Portfolio Admin
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Portfolio Admin
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (for local Supabase)

7. Copy the **Client ID** and **Client Secret**

### 3. Configure Supabase with Google Credentials

1. In Supabase Dashboard > Authentication > Providers > Google
2. Paste your **Client ID**
3. Paste your **Client Secret**
4. Click **Save**

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Admin Email Whitelist
   NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com,teammate@gmail.com
   ```

### 5. Test the Authentication

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000/admin/login

3. Click "Sign in with Google"

4. Authorize with a whitelisted email

5. You should be redirected to the admin dashboard

## Security Features

### ✅ OAuth 2.0
- No passwords to manage
- Google handles authentication
- Secure token-based sessions

### ✅ Email Whitelist
- Only authorized emails can access admin
- Configured via environment variable
- Checked on both client and server

### ✅ Middleware Protection
- Routes protected at the edge
- Runs before page loads
- Impossible to bypass

### ✅ API Security
- All write operations require auth
- Server-side validation
- Protected by Supabase RLS

### ✅ Session Management
- HTTP-only cookies
- Auto token refresh
- Secure by default

## Adding New Admin Users

1. Open `.env.local`
2. Add new email to `NEXT_PUBLIC_ADMIN_EMAILS`:
   ```env
   NEXT_PUBLIC_ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com,admin3@gmail.com
   ```
3. Restart the dev server
4. New user can now sign in with their Google account

## Production Deployment

### Vercel/Netlify:
1. Add environment variables in dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAILS`

2. Update Google OAuth redirect URIs:
   - Add your production domain

3. Deploy!

## Troubleshooting

### "Unauthorized" error after sign in?
- Check if your email is in `NEXT_PUBLIC_ADMIN_EMAILS`
- Verify environment variables are set correctly
- Restart dev server after changing `.env.local`

### Redirect loop?
- Clear browser cookies
- Check Supabase URL is correct
- Verify OAuth callback URL in Google Console

### "Invalid redirect URI" from Google?
- Add the redirect URI to Google Console
- Format: `https://your-project.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes

### Auth not working in production?
- Verify environment variables are set in hosting platform
- Check production domain is in Google OAuth authorized origins
- Ensure Supabase project is not paused

## Migration from Old Auth

If you had the old localStorage auth:

1. No migration needed - just remove old data:
   ```javascript
   localStorage.removeItem('portfolio_auth_temp');
   ```

2. All users will need to sign in with Google OAuth

3. Old username/password system is removed

## Support

For issues:
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2
