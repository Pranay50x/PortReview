import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, userType } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    console.log('=== Google OAuth Callback (Backend) ===');
    console.log('User type:', userType);
    console.log('Code present:', code ? 'Yes' : 'No');

    // Exchange code for access token
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/auth/google/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      console.error('Token exchange failed:', tokenError);
      return NextResponse.json({ 
        error: 'Failed to exchange code for access token',
        detail: tokenError.error 
      }, { status: 400 });
    }

    const { access_token } = await tokenResponse.json();

    // Get user data from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'PortReview-App'
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch Google user data');
      return NextResponse.json({ 
        error: 'Failed to fetch user data from Google' 
      }, { status: 400 });
    }

    const googleUser = await userResponse.json();
    console.log('Google user:', googleUser.name);

    // Create user object
    const user = {
      id: googleUser.id.toString(),
      name: googleUser.name,
      email: googleUser.email,
      user_type: 'recruiter' as const,
      avatar_url: googleUser.picture,
      is_active: true
    };

    // Save user to MongoDB/database (non-blocking)
    try {
      console.log('Attempting to save user to database...');
      const saveResponse = await fetch(`${request.nextUrl.origin}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          user_type: 'recruiter',
          profile: {
            avatar_url: user.avatar_url,
          }
        })
      });

      if (saveResponse.ok) {
        console.log('User saved to database successfully');
      } else {
        const errorText = await saveResponse.text();
        console.warn('Failed to save user to database (non-critical):', saveResponse.status, errorText);
      }
    } catch (error) {
      console.warn('Database save error (non-critical):', error instanceof Error ? error.message : 'Unknown error');
      // Continue with OAuth even if database save fails
    }

    // Set auth cookie
    const response = NextResponse.json({ 
      success: true, 
      user,
      message: 'Google authentication successful'
    });

    response.cookies.set('auth-token', JSON.stringify(user), {
      httpOnly: false, // Need to read in client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log('Google OAuth successful for:', user.name);
    return response;

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during Google authentication',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}