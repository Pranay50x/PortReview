import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Google OAuth Callback (Backend) - SIMPLIFIED ===');
    
    // Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { code, userType } = body;

    if (!code) {
      console.log('Missing authorization code');
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    console.log('User type:', userType);
    console.log('Code present:', code ? 'Yes' : 'No');

    // Check environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Use production URL for redirect URI
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://portreview.appwrite.network/auth/google/callback'
      : `${request.nextUrl.origin}/auth/google/callback`;

    console.log('Environment check:');
    console.log('- Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING');
    console.log('- Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'MISSING');
    console.log('- Redirect URI:', redirectUri);

    if (!clientId || !clientSecret) {
      console.error('Google OAuth environment variables missing');
      return NextResponse.json({
        error: 'Google OAuth is not properly configured',
        debug: {
          clientId: clientId ? 'SET' : 'MISSING',
          clientSecret: clientSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 });
    }

    // Exchange code for access token
    console.log('Starting token exchange...');
    const tokenRequestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    console.log('Token request body:', tokenRequestBody.toString());
    console.log('Exact redirect_uri being sent:', redirectUri);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    });

    console.log('Google token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Google token exchange failed:', errorText);
      return NextResponse.json({
        error: 'Failed to exchange authorization code for token',
        status: tokenResponse.status,
        detail: errorText,
        redirectUri
      }, { status: 400 });
    }

    let tokenData;
    try {
      tokenData = await tokenResponse.json();
    } catch (parseError) {
      const responseText = await tokenResponse.text();
      console.error('Failed to parse token response:', responseText);
      return NextResponse.json({
        error: 'Invalid token response format',
        detail: responseText
      }, { status: 500 });
    }

    if (tokenData.error) {
      console.error('Google returned error:', tokenData.error);
      return NextResponse.json({
        error: tokenData.error_description || tokenData.error,
        detail: tokenData
      }, { status: 400 });
    }

    const { access_token } = tokenData;
    console.log('Access token received:', access_token ? 'Yes' : 'No');

    // Get user data from Google
    console.log('Fetching user data...');
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'PortReview-App'
      }
    });

    console.log('Google user response status:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Failed to fetch Google user data:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch user data from Google',
        status: userResponse.status,
        detail: errorText
      }, { status: 400 });
    }

    const googleUser = await userResponse.json();
    console.log('Google user fetched:', googleUser.name);

    // Create user object
    const user = {
      id: googleUser.id.toString(),
      name: googleUser.name,
      email: googleUser.email,
      user_type: 'recruiter' as const,
      avatar_url: googleUser.picture,
      is_active: true
    };

    // Skip database save for now and just return success
    console.log('Google OAuth successful for:', user.name);

    // Set auth cookie
    const response = NextResponse.json({ 
      success: true, 
      user,
      message: 'Google authentication successful'
    });

    response.cookies.set('auth-token', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during Google authentication',
      detail: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}