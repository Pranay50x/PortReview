import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${request.nextUrl.origin}/auth/google/callback`;

    console.log('=== Google Token Exchange Debug ===');
    console.log('Client ID:', clientId?.substring(0, 20) + '...');
    console.log('Client Secret:', clientSecret?.substring(0, 10) + '...');
    console.log('Redirect URI:', redirectUri);
    console.log('Code:', code?.substring(0, 20) + '...');

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'Missing environment variables',
        debug: {
          clientId: clientId ? 'SET' : 'MISSING',
          clientSecret: clientSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 });
    }

    const tokenRequestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    console.log('Token request body:', tokenRequestBody.toString());

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    });

    console.log('Google response status:', tokenResponse.status);
    console.log('Google response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    const responseText = await tokenResponse.text();
    console.log('Google response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = { raw: responseText };
    }

    return NextResponse.json({
      status: tokenResponse.status,
      ok: tokenResponse.ok,
      response: responseData,
      debug: {
        clientId: clientId?.substring(0, 20) + '...',
        redirectUri,
        codeLength: code.length
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug test failed',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}