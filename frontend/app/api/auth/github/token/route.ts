import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    console.log('GitHub token exchange - Environment check:');
    console.log('- Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING');
    console.log('- Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'MISSING');

    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth environment variables missing:', { clientId: !!clientId, clientSecret: !!clientSecret });
      return NextResponse.json(
        { error: 'GitHub OAuth is not properly configured' },
        { status: 500 }
      );
    }

    // Exchange code for access token
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
      
      // Try to parse as JSON, fallback to text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      return NextResponse.json(
        { error: 'Failed to exchange code for token', detail: errorData },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    return NextResponse.json({ access_token: tokenData.access_token });
  } catch (error) {
    console.error('GitHub token exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange code for token' },
      { status: 500 }
    );
  }
}
