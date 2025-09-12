import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('=== /api/auth/me endpoint called ===');
    
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    console.log('Auth token cookie present:', authToken ? 'Yes' : 'No');
    
    if (!authToken || !authToken.value) {
      console.log('No auth token found in cookies');
      return NextResponse.json({ 
        error: 'Not authenticated',
        authenticated: false 
      }, { status: 401 });
    }

    // Parse the user data from the cookie
    let user;
    try {
      user = JSON.parse(authToken.value);
      console.log('Parsed user from cookie:', user.name, '(', user.user_type, ')');
      console.log('Full user object:', user);
    } catch (parseError) {
      console.error('Failed to parse auth token:', parseError);
      return NextResponse.json({ 
        error: 'Invalid auth token',
        authenticated: false 
      }, { status: 401 });
    }

    // Validate user object structure - email can be null for GitHub users
    if (!user || !user.id || !user.user_type || !user.name) {
      console.log('Invalid user object structure - missing required fields');
      console.log('Required fields check:', {
        hasUser: !!user,
        hasId: !!(user && user.id),
        hasUserType: !!(user && user.user_type),
        hasName: !!(user && user.name)
      });
      return NextResponse.json({ 
        error: 'Invalid user data',
        authenticated: false 
      }, { status: 401 });
    }

    // Return the current user
    console.log('Returning authenticated user:', user.name);
    return NextResponse.json({ 
      user,
      authenticated: true,
      message: 'User authenticated successfully'
    });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      authenticated: false 
    }, { status: 500 });
  }
}