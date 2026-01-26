# Authentication Setup Guide

This guide explains how to set up email/password authentication for the admin panel.

## Overview

The portfolio uses Supabase Authentication with email/password login. Any user with valid credentials can access the admin panel to manage projects.

## Initial Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use an existing one
3. Wait for the project to initialize

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the Project URL and anon/public key
   
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Run Database Schema

1. Go to Supabase Dashboard > SQL Editor
2. Create a new query
3. Copy the contents of `supabase/schema.sql`
4. Run the query

This creates:
- `projects` table for project data
- `content_blocks` table for project descriptions
- Row Level Security (RLS) policies
- Required indexes

### 4. Create Admin User

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" or "Invite user"
3. Choose "Create new user"
4. Enter:
   - Email address
   - Password (minimum 6 characters)
5. Click "Create user"

> **Note**: You can create multiple admin users this way. All authenticated users have admin access.

## Using the Admin Panel

### Login

1. Navigate to `/admin/login` on your site
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to `/admin` dashboard

### Logout

1. Click the "Logout" button in the admin dashboard
2. You'll be redirected to the home page

### Forgot Password

If you forget your password:

1. Click "Forgot password?" on the login page
2. Enter your email address
3. Check your email for the reset link
4. Follow the link and create a new password

> **Note**: The forgot password feature requires email templates to be configured in Supabase Dashboard > Authentication > Email Templates

## Security Features

### Authentication
- Passwords are hashed and stored securely by Supabase
- Sessions use HTTP-only cookies
- JWT tokens are automatically refreshed

### Route Protection
- `/admin/*` routes are protected by middleware
- API routes check authentication before write operations
- Unauthorized requests are redirected to login

### Database Security
- Row Level Security (RLS) enabled on all tables
- Public read access for projects (for website visitors)
- Write operations require authentication
- Supabase handles SQL injection prevention

## Email Configuration (Optional)

To enable password reset and email verification:

1. Go to Supabase Dashboard > Authentication > Email Templates
2. Customize email templates:
   - Confirm signup
   - Reset password
   - Magic link
3. Configure SMTP settings (or use Supabase's built-in email)

## Troubleshooting

### Cannot Login

**Problem**: "Invalid login credentials" error

**Solutions**:
- Verify email and password are correct
- Check that user exists in Supabase Dashboard > Authentication > Users
- Ensure user's email is confirmed (or disable email confirmation in Auth settings)

### Redirected to Login After Signing In

**Problem**: Authenticated but still can't access admin panel

**Solutions**:
- Check browser console for errors
- Verify environment variables are set correctly
- Clear browser cookies and try again
- Check Supabase project is active and not paused

### Password Reset Not Working

**Problem**: No email received for password reset

**Solutions**:
- Check spam folder
- Verify SMTP is configured in Supabase
- Check email templates are enabled
- Use Supabase Dashboard to manually reset password instead

### RLS Policy Issues

**Problem**: Database operations failing with permission errors

**Solutions**:
- Verify schema.sql was run correctly
- Check RLS policies in Supabase Dashboard > Database > Policies
- Ensure anon key has correct permissions
- Check API routes are calling `requireAuth()` before write operations

## Advanced Configuration

### Disable Email Confirmation

If you want users to login immediately without email confirmation:

1. Go to Supabase Dashboard > Authentication > Settings
2. Scroll to "Email Confirmation"
3. Toggle "Enable email confirmations" to OFF

### Session Duration

To adjust how long users stay logged in:

1. Go to Supabase Dashboard > Authentication > Settings
2. Adjust "JWT expiry" (default: 3600 seconds = 1 hour)
3. Adjust "Refresh token expiry" (default: 2592000 seconds = 30 days)

### Add More Authentication Methods

To add more sign-in methods (Google, GitHub, etc.):

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable desired provider
3. Configure OAuth credentials
4. Update client code to use `signInWithOAuth()`

## Security Best Practices

1. **Strong Passwords**: Enforce minimum password requirements
2. **HTTPS Only**: Always use HTTPS in production
3. **Regular Updates**: Keep dependencies updated
4. **Environment Variables**: Never commit `.env.local` to git
5. **Backup Database**: Regularly backup your Supabase database
6. **Monitor Logs**: Check Supabase logs for suspicious activity
7. **Rate Limiting**: Consider adding rate limiting to login endpoint

## Support

For more information:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
