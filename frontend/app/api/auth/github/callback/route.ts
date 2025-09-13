import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== GitHub OAuth Callback (Backend) - SIMPLIFIED ===');
    
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
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    console.log('Environment check:');
    console.log('- Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'MISSING');
    console.log('- Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'MISSING');

    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth environment variables missing');
      return NextResponse.json({
        error: 'GitHub OAuth is not properly configured',
        debug: {
          clientId: clientId ? 'SET' : 'MISSING',
          clientSecret: clientSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 });
    }

    // Exchange code for access token
    console.log('Starting token exchange...');
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    console.log('GitHub token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GitHub token exchange failed:', errorText);
      return NextResponse.json({
        error: 'Failed to exchange authorization code for token',
        status: tokenResponse.status,
        detail: errorText
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
      console.error('GitHub returned error:', tokenData.error);
      return NextResponse.json({
        error: tokenData.error_description || tokenData.error,
        detail: tokenData
      }, { status: 400 });
    }

    const { access_token } = tokenData;
    console.log('Access token received:', access_token ? 'Yes' : 'No');

    // Get user data from GitHub
    console.log('Fetching user data...');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'PortReview-App'
      }
    });

    console.log('GitHub user response status:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Failed to fetch GitHub user data:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch user data from GitHub',
        status: userResponse.status,
        detail: errorText
      }, { status: 400 });
    }

    const githubUser = await userResponse.json();
    console.log('GitHub user fetched:', githubUser.login);

    // Create simplified user object
    const user = {
      id: githubUser.id.toString(),
      name: githubUser.name || githubUser.login,
      email: githubUser.email || `${githubUser.login}@github.local`,
      user_type: 'developer' as const,
      github_username: githubUser.login,
      avatar_url: githubUser.avatar_url,
      is_active: true
    };

    // Skip database save for now and just return success
    console.log('GitHub OAuth successful for:', user.name);

    // Set auth cookie
    const response = NextResponse.json({ 
      success: true, 
      user,
      message: 'GitHub authentication successful'
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
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during GitHub authentication',
      detail: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}