// Unified Authentication System
import { githubAuthService, DeveloperUser } from './auth-github';
import { googleAuthService, RecruiterUser } from './auth-google';

export type User = DeveloperUser | RecruiterUser;

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

class UnifiedAuthService {
  // Check if any user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Get current user (developer or recruiter)
  getCurrentUser(): User | null {
    const developer = githubAuthService.getCurrentUser();
    if (developer) return developer;

    const recruiter = googleAuthService.getCurrentUser();
    if (recruiter) return recruiter;

    return null;
  }

  // Get user type
  getUserType(): 'developer' | 'recruiter' | null {
    const user = this.getCurrentUser();
    return user?.user_type || null;
  }

  // Sign out from all services
  signOut(): void {
    githubAuthService.signOut();
    googleAuthService.signOut();
    localStorage.removeItem('auth_flow_type');
  }

  // Developer authentication
  redirectToGitHub() {
    return githubAuthService.redirectToGitHub();
  }

  async handleGitHubCallback(code: string): Promise<AuthResult> {
    return githubAuthService.handleGitHubCallback(code);
  }

  // Recruiter authentication  
  redirectToGoogle() {
    return googleAuthService.redirectToGoogle();
  }

  async handleGoogleCallback(code: string): Promise<AuthResult> {
    return googleAuthService.handleGoogleCallback(code);
  }

  // Get appropriate tokens
  getAccessToken(): string | null {
    const userType = this.getUserType();
    if (userType === 'developer') {
      return githubAuthService.getGitHubToken();
    } else if (userType === 'recruiter') {
      return googleAuthService.getGoogleToken();
    }
    return null;
  }

  // Manual authentication for developers (fallback)
  async developerSignUp(userData: {
    name: string;
    email: string;
    password: string;
    github_username?: string;
    company?: string;
  }): Promise<AuthResult> {
    try {
      // Create developer user with manual signup
      const user: DeveloperUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        user_type: 'developer',
        github_username: userData.github_username || '',
        company: userData.company,
      };

      // Store user data locally
      localStorage.setItem('auth_developer', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Developer registration failed' };
    }
  }

  async developerSignIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Try to get developer from localStorage (fallback method)
      const storedUser = localStorage.getItem('auth_developer');
      if (storedUser) {
        const user: DeveloperUser = JSON.parse(storedUser);
        if (user.email === email) {
          return { success: true, user };
        }
      }

      return { success: false, error: 'Invalid credentials or user not found' };
    } catch (error) {
      return { success: false, error: 'Developer login failed' };
    }
  }
}

export const authService = new UnifiedAuthService();

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
