import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per 5 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = rateLimiter.check(clientIp, 3, 5 * 60 * 1000);

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Use Web3Forms API for sending email
    // Use FormData format to bypass Cloudflare protection
    const formData = new FormData();
    formData.append('access_key', process.env.WEB3FORMS_ACCESS_KEY || '');
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);

    const web3FormsResponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData,
    });

    // Check if response is JSON
    const contentType = web3FormsResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await web3FormsResponse.text();
      console.error('Non-JSON response from Web3Forms:', text.substring(0, 200));
      return NextResponse.json(
        { error: 'Email service configuration error. Please check your Access Key.' },
        { status: 500 }
      );
    }

    const result = await web3FormsResponse.json();

    if (result.success) {
      return NextResponse.json(
        { success: true, message: 'Message sent successfully!' },
        { status: 200 }
      );
    } else {
      console.error('Web3Forms error:', result);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
