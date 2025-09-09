// Google OAuth for Recruiters only
export interface RecruiterUser {
  id: string;
  name: string;
  email: string;
  user_type: 'recruiter';
  avatar_url?: string;
  company?: string;
  position?: string;
  google_profile?: {
    verified_email?: boolean;
    locale?: string;
    picture?: string;
  };
}

export interface AuthResult {
  success: boolean;
  user?: RecruiterUser;
  error?: string;
}

class GoogleAuthService {
  private storageKey = 'auth_recruiter';
  private tokenKey = 'auth_google_token';

  // MongoDB integration for recruiters
  private async saveRecruiterToMongoDB(user: RecruiterUser): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        user_type: 'recruiter',
        profile: {
          bio: user.position,
          company: user.company,
          avatar_url: user.avatar_url,
          google_profile: user.google_profile,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save recruiter to MongoDB');
    }
  }

  private async getRecruiterFromMongoDB(email: string): Promise<RecruiterUser | null> {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}&user_type=recruiter`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch recruiter from MongoDB');
      }

      const mongoUser = await response.json();
      
      // Convert MongoDB user to our RecruiterUser interface
      return {
        id: mongoUser.id,
        name: mongoUser.name,
        email: mongoUser.email,
        user_type: 'recruiter',
        avatar_url: mongoUser.profile?.avatar_url,
        company: mongoUser.profile?.company,
        position: mongoUser.profile?.bio,
        google_profile: mongoUser.profile?.google_profile,
      };
    } catch (error) {
      console.error('Error fetching recruiter from MongoDB:', error);
      return null;
    }
  }

  // Google OAuth for recruiters
  redirectToGoogle() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/auth/google/callback';
    const scope = 'openid email profile';
    
    console.log('=== Google OAuth Redirect (Recruiter) ===');
    
    if (!clientId) {
      console.error('Google Client ID not found in environment variables');
      throw new Error('Google OAuth not configured');
    }
    
    // Store user type for after OAuth
    localStorage.setItem('auth_flow_type', 'google_recruiter');
    console.log('Stored auth_flow_type: google_recruiter');
    
    const googleURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('Redirecting to Google OAuth for recruiter authentication');
    window.location.href = googleURL;
  }

  async handleGoogleCallback(code: string): Promise<AuthResult> {
    try {
      console.log('=== Google Callback Handler (Recruiter) ===');
      console.log('Processing OAuth callback with code:', code ? 'Present' : 'Missing');
      
      // Exchange code for access token
      const tokenResponse = await fetch('/api/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { access_token } = await tokenResponse.json();
      console.log('Got Google access token:', access_token ? 'Yes' : 'No');

      // Get user data from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data from Google');
      }

      const googleUser = await userResponse.json();
      console.log('Google user data:', googleUser.email);

      // Create recruiter user object
      const user: RecruiterUser = {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        user_type: 'recruiter',
        avatar_url: googleUser.picture,
        google_profile: {
          verified_email: googleUser.verified_email,
          locale: googleUser.locale,
          picture: googleUser.picture,
        },
      };

      console.log('=== Created Recruiter User Object ===');
      console.log('User name:', user.name);
      console.log('Email:', user.email);
      console.log('Will redirect to: /dashboard/recruiter');

      // Store user in MongoDB
      try {
        await this.saveRecruiterToMongoDB(user);
        console.log('Recruiter saved to MongoDB');
      } catch (mongoError) {
        console.error('Failed to save recruiter to MongoDB:', mongoError);
        // Continue with local storage as fallback
      }

      // Store user data locally
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      localStorage.setItem(this.tokenKey, access_token);
      localStorage.removeItem('auth_flow_type');

      console.log('Recruiter stored in localStorage');
      return { success: true, user };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Google authentication failed' };
    }
  }

  signOut(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('auth_flow_type');
  }

  getCurrentUser(): RecruiterUser | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getGoogleToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

export const googleAuthService = new GoogleAuthService();
