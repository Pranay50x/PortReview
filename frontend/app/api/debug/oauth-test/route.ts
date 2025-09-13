import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { provider, code } = await request.json();

    if (!code || !provider) {
      return NextResponse.json({ error: 'Code and provider required' }, { status: 400 });
    }

    let result;

    if (provider === 'github') {
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      console.log('GitHub Test - Client ID:', clientId ? 'SET' : 'MISSING');
      console.log('GitHub Test - Client Secret:', clientSecret ? 'SET' : 'MISSING');

      if (!clientId || !clientSecret) {
        return NextResponse.json({
          error: 'GitHub OAuth not configured',
          details: {
            clientId: clientId ? 'SET' : 'MISSING',
            clientSecret: clientSecret ? 'SET' : 'MISSING'
          }
        }, { status: 500 });
      }

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
      const responseText = await tokenResponse.text();
      console.log('GitHub token response:', responseText);

      result = {
        provider: 'github',
        status: tokenResponse.status,
        ok: tokenResponse.ok,
        response: responseText
      };
    } else if (provider === 'google') {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${request.nextUrl.origin}/auth/google/callback`;

      console.log('Google Test - Client ID:', clientId ? 'SET' : 'MISSING');
      console.log('Google Test - Client Secret:', clientSecret ? 'SET' : 'MISSING');
      console.log('Google Test - Redirect URI:', redirectUri);

      if (!clientId || !clientSecret) {
        return NextResponse.json({
          error: 'Google OAuth not configured',
          details: {
            clientId: clientId ? 'SET' : 'MISSING',
            clientSecret: clientSecret ? 'SET' : 'MISSING'
          }
        }, { status: 500 });
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      console.log('Google token response status:', tokenResponse.status);
      const responseText = await tokenResponse.text();
      console.log('Google token response:', responseText);

      result = {
        provider: 'google',
        status: tokenResponse.status,
        ok: tokenResponse.ok,
        response: responseText,
        redirectUri
      };
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('OAuth test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}