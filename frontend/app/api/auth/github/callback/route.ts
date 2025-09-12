import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, userType } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    console.log('=== GitHub OAuth Callback (Backend) ===');
    console.log('User type:', userType);
    console.log('Code present:', code ? 'Yes' : 'No');

    // Exchange code for access token
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/auth/github/token`, {
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

    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'PortReview-App'
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch GitHub user data');
      return NextResponse.json({ 
        error: 'Failed to fetch user data from GitHub' 
      }, { status: 400 });
    }

    const githubUser = await userResponse.json();
    console.log('GitHub user:', githubUser.login);

    // Get user's email if not public
    let userEmail = githubUser.email;
    if (!userEmail) {
      console.log('Public email not available, fetching primary email...');
      try {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'User-Agent': 'PortReview-App'
          }
        });
        
        if (emailResponse.ok) {
          const emails = await emailResponse.json();
          const primaryEmail = emails.find((e: any) => e.primary);
          userEmail = primaryEmail ? primaryEmail.email : `${githubUser.login}@github.local`;
          console.log('Found primary email:', userEmail);
        } else {
          userEmail = `${githubUser.login}@github.local`;
          console.log('Using fallback email:', userEmail);
        }
      } catch (emailError) {
        console.error('Error fetching emails:', emailError);
        userEmail = `${githubUser.login}@github.local`;
      }
    }

    // Create user object
    const user = {
      id: githubUser.id.toString(),
      name: githubUser.name || githubUser.login,
      email: userEmail,
      user_type: 'developer' as const,
      github_username: githubUser.login,
      avatar_url: githubUser.avatar_url,
      is_active: true
    };

    // Save user to MongoDB/database
    try {
      const saveResponse = await fetch(`${request.nextUrl.origin}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          user_type: 'developer',
          profile: {
            github_username: user.github_username,
            avatar_url: user.avatar_url,
          }
        })
      });

      if (!saveResponse.ok) {
        console.warn('Failed to save user to database, continuing...');
      }
    } catch (error) {
      console.warn('Database save error:', error);
    }

    // Set auth cookie
    const response = NextResponse.json({ 
      success: true, 
      user,
      message: 'GitHub authentication successful'
    });

    response.cookies.set('auth-token', JSON.stringify(user), {
      httpOnly: false, // Need to read in client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log('GitHub OAuth successful for:', user.name);
    console.log('Setting auth-token cookie with:', JSON.stringify(user).substring(0, 100) + '...');
    console.log('Cookie settings - httpOnly: false, secure:', process.env.NODE_ENV === 'production');
    return response;

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during GitHub authentication',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}