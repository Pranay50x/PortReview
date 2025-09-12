import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate a random CSRF token
    const csrfToken = randomBytes(32).toString('base64url');
    
    // Create response with CSRF token
    const response = NextResponse.json({ 
      csrfToken,
      timestamp: Date.now()
    });
    
    // Set CSRF token in httpOnly cookie for additional security
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });
    
    console.log('CSRF token generated successfully');
    return response;
    
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json({ 
      error: 'Failed to generate CSRF token' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { csrfToken } = await request.json();
    const cookieToken = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid CSRF token' 
      }, { status: 403 });
    }
    
    return NextResponse.json({ valid: true });
    
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to validate CSRF token' 
    }, { status: 500 });
  }
}