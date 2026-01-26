# Contact Form Setup

The contact form uses [Web3Forms](https://web3forms.com) to send emails. Follow these steps to set it up:

## Setup Instructions

1. **Get a free Web3Forms Access Key:**
   - Visit [https://web3forms.com](https://web3forms.com)
   - Sign up with your email (nurulaldi333@gmail.com)
   - Verify your email address
   - Copy your Access Key from the dashboard

2. **Add the Access Key to your environment:**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and replace `your_access_key_here` with your actual Web3Forms Access Key:
     ```
     WEB3FORMS_ACCESS_KEY=your_actual_access_key_here
     ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## How It Works

- Contact form submissions are sent via POST to `/api/contact`
- The API route uses Web3Forms API to send emails
- Emails are delivered to: **nurulaldi333@gmail.com**
- Users receive success/error messages after submission
- Form automatically resets on successful submission

## Features

- ✅ Real-time form validation
- ✅ Loading states during submission
- ✅ Success/error notifications
- ✅ Automatic form reset on success
- ✅ Email validation
- ✅ Spam protection via Web3Forms
- ✅ No backend server required

## Testing

To test the contact form:
1. Fill in all required fields (Name, Email, Message)
2. Click "Send Message"
3. Check nurulaldi333@gmail.com for the email
4. Verify the success message appears on the form

## Alternative Email Services

If you prefer to use a different email service, you can replace the Web3Forms integration in `/app/api/contact/route.ts` with:

- **Resend**: Modern email API (requires npm package)
- **SendGrid**: Enterprise email service (requires npm package)
- **Nodemailer**: SMTP-based solution (requires SMTP credentials)
- **EmailJS**: Client-side email service (no backend needed)

## Troubleshooting

- **Emails not arriving?** Check spam folder and verify your Web3Forms Access Key
- **API errors?** Make sure `.env.local` exists and contains the correct Access Key
- **Still not working?** Check the browser console and server logs for error messages
