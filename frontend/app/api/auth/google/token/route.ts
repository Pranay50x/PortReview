// Google OAuth token exchange endpoint
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Use production URL for redirect URI
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://portreview.appwrite.network/auth/google/callback'
      : `${request.nextUrl.origin}/auth/google/callback`;

    console.log('Google token exchange - Environment check:');
    console.log('- Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING');
    console.log('- Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : 'MISSING');
    console.log('- Redirect URI:', redirectUri);

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth is not properly configured' },
        { status: 500 }
      );
    }

    // Exchange authorization code for access token
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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Google token exchange failed:', errorText);
      
      // Try to parse as JSON, fallback to text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      return NextResponse.json(
        { error: 'Failed to exchange authorization code for token', detail: errorData },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
