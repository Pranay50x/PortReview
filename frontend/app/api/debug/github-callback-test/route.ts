import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'GitHub callback route is accessible' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== GitHub Callback Route Debug ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    console.log('Request body:', body);

    const { code, userType } = body;

    if (!code) {
      console.log('Missing authorization code');
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    console.log('Code present:', code ? 'Yes' : 'No');
    console.log('User type:', userType);

    // Test environment variables
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    console.log('GitHub Client ID:', clientId ? 'SET' : 'MISSING');
    console.log('GitHub Client Secret:', clientSecret ? 'SET' : 'MISSING');

    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth environment variables missing');
      return NextResponse.json({
        error: 'GitHub OAuth is not properly configured',
        details: {
          clientId: clientId ? 'SET' : 'MISSING',
          clientSecret: clientSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 });
    }

    // Test token exchange
    console.log('Attempting token exchange...');
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
    console.log('GitHub token response ok:', tokenResponse.ok);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GitHub token exchange failed:', errorText);
      return NextResponse.json({
        error: 'Token exchange failed',
        status: tokenResponse.status,
        detail: errorText
      }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    console.log('Token data received:', tokenData ? 'Yes' : 'No');

    if (tokenData.error) {
      console.error('GitHub returned error:', tokenData.error);
      return NextResponse.json({
        error: tokenData.error_description || tokenData.error
      }, { status: 400 });
    }

    const { access_token } = tokenData;
    console.log('Access token received:', access_token ? 'Yes' : 'No');

    // Test user data fetch
    console.log('Fetching user data from GitHub...');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'PortReview-App'
      }
    });

    console.log('GitHub user response status:', userResponse.status);
    console.log('GitHub user response ok:', userResponse.ok);

    if (!userResponse.ok) {
      const userErrorText = await userResponse.text();
      console.error('Failed to fetch GitHub user data:', userErrorText);
      return NextResponse.json({ 
        error: 'Failed to fetch user data from GitHub',
        detail: userErrorText
      }, { status: 400 });
    }

    const githubUser = await userResponse.json();
    console.log('GitHub user:', githubUser.login);

    return NextResponse.json({
      success: true,
      message: 'GitHub callback test successful',
      user: {
        id: githubUser.id.toString(),
        name: githubUser.name || githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.local`,
        login: githubUser.login
      }
    });

  } catch (error) {
    console.error('GitHub callback test error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during GitHub callback test',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}