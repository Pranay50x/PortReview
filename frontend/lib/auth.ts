// Frontend authentication system with GitHub OAuth
export interface User {
  id: string;
  name: string;
  email: string;
  user_type: 'developer' | 'recruiter';
  github_username?: string;
  avatar_url?: string;
  company?: string;
  position?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private storageKey = 'auth_user';
  private tokenKey = 'auth_token';

  // GitHub OAuth
  redirectToGitHub(userType: 'developer' | 'recruiter') {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/auth/callback';
    const scope = 'read:user user:email';
    
    // Store user type for after OAuth
    localStorage.setItem('auth_user_type', userType);
    
    const githubURL = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubURL;
  }

  async handleGitHubCallback(code: string): Promise<AuthResult> {
    try {
      const userType = localStorage.getItem('auth_user_type') || 'developer';
      console.log('GitHub callback - userType from localStorage:', userType);
      
      // Exchange code for access token
      const tokenResponse = await fetch('/api/auth/github/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { access_token } = await tokenResponse.json();
      console.log('Got access token:', access_token ? 'Yes' : 'No');

      // Get user data from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const githubUser = await userResponse.json();
      console.log('GitHub user data:', githubUser);

      // Get user email
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email || githubUser.email;

      // Create user object
      const user: User = {
        id: githubUser.id.toString(),
        name: githubUser.name || githubUser.login,
        email: primaryEmail,
        user_type: userType as 'developer' | 'recruiter',
        github_username: githubUser.login,
        avatar_url: githubUser.avatar_url,
        company: githubUser.company,
        position: githubUser.bio,
      };

      console.log('Created user object:', user);

      // Store user data
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      localStorage.setItem(this.tokenKey, access_token);
      localStorage.removeItem('auth_user_type');

      console.log('User stored in localStorage');
      return { success: true, user };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Manual authentication
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
    user_type: 'developer' | 'recruiter';
    github_username?: string;
    company?: string;
  }): Promise<AuthResult> {
    try {
      // Create user with manual signup
      const user: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        user_type: userData.user_type,
        github_username: userData.github_username,
        company: userData.company,
      };

      // Store user data
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // For demo purposes, check if user exists in localStorage
      // In production, this would authenticate with your backend
      const storedUser = localStorage.getItem(this.storageKey);
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return { success: true, user };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  signOut(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('auth_user_type');
  }

  getCurrentUser(): User | null {
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
}

export const authService = new AuthService();

// Backward compatibility exports
export const getCurrentUser = () => authService.getCurrentUser();
export const signOut = () => authService.signOut();
export const isAuthenticated = () => authService.isAuthenticated();

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Direct auth functions for compatibility
export const signUp = (
  name: string,
  email: string,
  password: string,
  userType: 'developer' | 'recruiter',
  githubUsername?: string,
  company?: string
) => authService.signUp({ name, email, password, user_type: userType, github_username: githubUsername, company });

export const signIn = (email: string, password: string) => authService.signIn(email, password);
