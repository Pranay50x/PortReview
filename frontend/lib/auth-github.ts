// GitHub OAuth for Developers only
export interface DeveloperUser {
  id: string;
  name: string;
  email: string;
  user_type: 'developer';
  github_username: string;
  avatar_url?: string;
  company?: string;
  position?: string;
  github_profile?: {
    bio?: string;
    blog?: string;
    location?: string;
    public_repos?: number;
    followers?: number;
    following?: number;
  };
}

export interface AuthResult {
  success: boolean;
  user?: DeveloperUser;
  error?: string;
}

class GitHubAuthService {
  private storageKey = 'auth_developer';
  private tokenKey = 'auth_github_token';

  // MongoDB integration for developers
  private async saveDeveloperToMongoDB(user: DeveloperUser): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        user_type: 'developer',
        github_username: user.github_username,
        profile: {
          bio: user.position,
          company: user.company,
          avatar_url: user.avatar_url,
          github_profile: user.github_profile,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save developer to MongoDB');
    }
  }

  private async getDeveloperFromMongoDB(email: string): Promise<DeveloperUser | null> {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}&user_type=developer`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch developer from MongoDB');
      }

      const mongoUser = await response.json();
      
      // Convert MongoDB user to our DeveloperUser interface
      return {
        id: mongoUser.id,
        name: mongoUser.name,
        email: mongoUser.email,
        user_type: 'developer',
        github_username: mongoUser.github_username,
        avatar_url: mongoUser.profile?.avatar_url,
        company: mongoUser.profile?.company,
        position: mongoUser.profile?.bio,
        github_profile: mongoUser.profile?.github_profile,
      };
    } catch (error) {
      console.error('Error fetching developer from MongoDB:', error);
      return null;
    }
  }

  // GitHub OAuth for developers
  redirectToGitHub() {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'read:user user:email';
    
    console.log('=== GitHub OAuth Redirect (Developer) ===');
    
    // Store user type for after OAuth
    localStorage.setItem('auth_flow_type', 'github_developer');
    console.log('Stored auth_flow_type: github_developer');
    
    const githubURL = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    console.log('Redirecting to GitHub OAuth for developer authentication');
    window.location.href = githubURL;
  }

  async handleGitHubCallback(code: string): Promise<AuthResult> {
    try {
      console.log('=== GitHub Callback Handler (Developer) ===');
      console.log('Processing OAuth callback with code:', code ? 'Present' : 'Missing');
      
      // Exchange code for access token
      const tokenResponse = await fetch('/api/auth/github/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('GitHub token exchange failed:', errorText);
        throw new Error('Failed to exchange code for token: ' + errorText);
      }

      let tokenData;
      try {
        tokenData = await tokenResponse.json();
      } catch (parseError) {
        const responseText = await tokenResponse.text();
        console.error('Failed to parse token response as JSON:', responseText);
        throw new Error('Invalid response from token endpoint: ' + responseText);
      }

      const { access_token } = tokenData;
      console.log('Got GitHub access token:', access_token ? 'Yes' : 'No');

      // Get user data from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data from GitHub');
      }

      const githubUser = await userResponse.json();
      console.log('GitHub user data:', githubUser.login);

      // Get user email
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email || githubUser.email;

      // Create developer user object
      const user: DeveloperUser = {
        id: githubUser.id.toString(),
        name: githubUser.name || githubUser.login,
        email: primaryEmail,
        user_type: 'developer',
        github_username: githubUser.login,
        avatar_url: githubUser.avatar_url,
        company: githubUser.company,
        position: githubUser.bio,
        github_profile: {
          bio: githubUser.bio,
          blog: githubUser.blog,
          location: githubUser.location,
          public_repos: githubUser.public_repos,
          followers: githubUser.followers,
          following: githubUser.following,
        },
      };

      console.log('=== Created Developer User Object ===');
      console.log('User name:', user.name);
      console.log('GitHub username:', user.github_username);
      console.log('Will redirect to: /dashboard/developer');

      // Store user in MongoDB
      try {
        await this.saveDeveloperToMongoDB(user);
        console.log('Developer saved to MongoDB');
      } catch (mongoError) {
        console.error('Failed to save developer to MongoDB:', mongoError);
        // Continue with local storage as fallback
      }

      // Store user data locally
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      localStorage.setItem(this.tokenKey, access_token);
      localStorage.removeItem('auth_flow_type');

      console.log('Developer stored in localStorage');
      return { success: true, user };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'GitHub authentication failed' };
    }
  }

  signOut(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('auth_flow_type');
  }

  getCurrentUser(): DeveloperUser | null {
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

  getGitHubToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

export const githubAuthService = new GitHubAuthService();
