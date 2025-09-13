// Secure Authentication Service - Production Ready
export interface SecureUser {
  id: string;
  name: string;
  email: string;
  user_type: 'developer' | 'recruiter';
  github_username?: string;
  avatar_url?: string;
  company?: string;
  is_active: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: SecureUser;
  error?: string;
  message?: string;
}

class SecureAuthService {
  private baseUrl = '/api/auth';
  private csrfToken: string | null = null;
  private pendingRequests = new Map<string, Promise<AuthResult>>();
  
  // Initialize CSRF token on service creation
  constructor() {
    this.initializeCSRF();
  }

  /**
   * Get the full URL for API requests
   */
  private getFullUrl(endpoint: string): string {
    // If we're on the server side, use relative paths
    if (typeof window === 'undefined') {
      return `${this.baseUrl}${endpoint}`;
    }
    // On client side, use full URL with origin
    return `${window.location.origin}${this.baseUrl}${endpoint}`;
  }

  /**
   * Initialize CSRF token from cookie
   */
  private async initializeCSRF(): Promise<void> {
    try {
      // Only initialize on client side to avoid server-side fetch issues
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await fetch(this.getFullUrl('/csrf-token'), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrf_token;
      }
    } catch (error) {
      console.warn('Could not initialize CSRF token:', error);
    }
  }

  /**
   * Get CSRF token for requests
   */
  private async getCSRFToken(): Promise<string | null> {
    if (!this.csrfToken) {
      await this.initializeCSRF();
    }
    return this.csrfToken;
  }

  /**
   * Make authenticated request with security headers
   */
  private async secureRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const csrfToken = await this.getCSRFToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return fetch(this.getFullUrl(endpoint), {
      ...options,
      credentials: 'include', // Include httpOnly cookies
      headers,
    });
  }

  /**
   * Check if user is authenticated by verifying session
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.secureRequest('/me');
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get current user from secure session
   */
  async getCurrentUser(): Promise<SecureUser | null> {
    try {
      const response = await this.secureRequest('/me');
      
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Developer GitHub OAuth flow
   */
  redirectToGitHub(): void {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'read:user user:email';
    
    // Generate secure state parameter
    const state = this.generateSecureState();
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('github_oauth_state', state);
    sessionStorage.setItem('auth_flow_type', 'github_developer');
    
    const githubURL = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    
    window.location.href = githubURL;
  }

  /**
   * Handle GitHub OAuth callback securely
   */
  async handleGitHubCallback(code: string, state?: string): Promise<AuthResult> {
    // Create a unique request key for deduplication
    const requestKey = `github_callback_${code}_${state || 'no_state'}`;
    
    // Check if this request is already in progress
    if (this.pendingRequests.has(requestKey)) {
      console.log('GitHub callback already in progress, returning existing promise');
      return this.pendingRequests.get(requestKey)!;
    }
    
    // Create and store the promise
    const requestPromise = this.executeGitHubCallback(code, state);
    this.pendingRequests.set(requestKey, requestPromise);
    
    // Clean up after completion
    requestPromise.finally(() => {
      this.pendingRequests.delete(requestKey);
    });
    
    return requestPromise;
  }

  private async executeGitHubCallback(code: string, state?: string): Promise<AuthResult> {
    try {
      console.log('=== handleGitHubCallback started ===');
      console.log('Code:', code ? 'Present' : 'Missing');
      console.log('State:', state);
      
      // Verify state parameter to prevent CSRF
      const storedState = sessionStorage.getItem('github_oauth_state');
      console.log('Stored state:', storedState);
      
      if (state && storedState && state !== storedState) {
        console.error('State mismatch - possible CSRF attack');
        sessionStorage.removeItem('github_oauth_state');
        sessionStorage.removeItem('auth_flow_type');
        return { success: false, error: 'Invalid state parameter. Possible CSRF attack.' };
      }

      // Clean up state
      sessionStorage.removeItem('github_oauth_state');
      sessionStorage.removeItem('auth_flow_type');

      console.log('Making secure request to /github/callback...');
      const response = await this.secureRequest('/github/callback', {
        method: 'POST',
        body: JSON.stringify({
          code,
          userType: 'developer'
        }),
      });

      console.log('Secure request response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Parsed response data:', data);
        return { 
          success: true, 
          user: data.user, 
          message: data.message 
        };
      } else {
        const error = await response.json();
        console.error('Backend callback error:', error);
        return { success: false, error: error.detail || error.error || 'GitHub authentication failed' };
      }
    } catch (error) {
      console.error('handleGitHubCallback exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error during authentication' 
      };
    }
  }

  /**
   * Google OAuth for recruiters
   */
  redirectToGoogle(): void {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid email profile';
    
    if (!clientId) {
      console.error('Google Client ID not found in environment variables');
      throw new Error('Google OAuth not configured');
    }

    // Generate secure state parameter
    const state = this.generateSecureState();
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('google_oauth_state', state);
    sessionStorage.setItem('auth_flow_type', 'google_recruiter');
    
    const googleURL = 
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      'access_type=offline';
    
    console.log('=== Secure Google OAuth Redirect (Recruiter) ===');
    console.log('Client ID:', clientId ? 'Present' : 'Missing');
    console.log('Redirect URI:', redirectUri);
    console.log('Redirecting to Google OAuth for recruiter authentication');
    
    window.location.href = googleURL;
  }

  /**
   * Handle Google OAuth callback securely
   */
  async handleGoogleCallback(code: string, state?: string): Promise<AuthResult> {
    // Create a unique request key for deduplication
    const requestKey = `google_callback_${code}_${state || 'no_state'}`;
    
    // Check if this request is already in progress
    if (this.pendingRequests.has(requestKey)) {
      console.log('Google callback already in progress, returning existing promise');
      return this.pendingRequests.get(requestKey)!;
    }
    
    // Create and store the promise
    const requestPromise = this.executeGoogleCallback(code, state);
    this.pendingRequests.set(requestKey, requestPromise);
    
    // Clean up after completion
    requestPromise.finally(() => {
      this.pendingRequests.delete(requestKey);
    });
    
    return requestPromise;
  }

  private async executeGoogleCallback(code: string, state?: string): Promise<AuthResult> {
    try {
      // Verify state parameter to prevent CSRF
      const storedState = sessionStorage.getItem('google_oauth_state');
      if (state && storedState && state !== storedState) {
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('auth_flow_type');
        return { success: false, error: 'Invalid state parameter. Possible CSRF attack.' };
      }

      // Clean up state
      sessionStorage.removeItem('google_oauth_state');
      sessionStorage.removeItem('auth_flow_type');

      const response = await this.secureRequest('/google/callback', {
        method: 'POST',
        body: JSON.stringify({
          code,
          userType: 'recruiter'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          user: data.user, 
          message: data.message 
        };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Google authentication failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error during authentication' 
      };
    }
  }

  /**
   * Secure user registration
   */
  async register(userData: {
    name: string;
    email: string;
    password: string;
    user_type: 'developer' | 'recruiter';
    github_username?: string;
    company?: string;
  }): Promise<AuthResult> {
    try {
      // Validate password strength on frontend
      const passwordValidation = this.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
        };
      }

      const response = await this.secureRequest('/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        await this.initializeCSRF();
        return { 
          success: true, 
          user: data.user, 
          message: data.message 
        };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Registration failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error during registration' 
      };
    }
  }

  /**
   * Secure login
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await this.secureRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.initializeCSRF();
        return { 
          success: true, 
          user: data.user, 
          message: data.message 
        };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Login failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error during login' 
      };
    }
  }

  /**
   * Refresh token automatically (handled by httpOnly cookies)
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.secureRequest('/refresh', {
        method: 'POST',
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Secure logout
   */
  async logout(): Promise<void> {
    try {
      await this.secureRequest('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear any client-side data
      this.csrfToken = null;
      sessionStorage.clear();
      
      // Redirect to login page
      window.location.href = '/auth/login';
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(): Promise<void> {
    try {
      await this.secureRequest('/logout-all-devices', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout all devices error:', error);
    } finally {
      this.csrfToken = null;
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }
  }

  /**
   * Validate password strength on frontend
   */
  private validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
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

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain repeated characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure state parameter for OAuth
   */
  private generateSecureState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Auto-refresh token when needed
   */
  async setupTokenRefresh(): Promise<void> {
    // Set up automatic token refresh every 10 minutes
    setInterval(async () => {
      if (await this.isAuthenticated()) {
        await this.refreshToken();
      }
    }, 10 * 60 * 1000); // 10 minutes
  }
}

// Create singleton instance
export const secureAuthService = new SecureAuthService();

// Export for compatibility
export const authService = secureAuthService;
export const getCurrentUser = () => secureAuthService.getCurrentUser();
export const isAuthenticated = () => secureAuthService.isAuthenticated();
export const signOut = () => secureAuthService.logout();

// Initialize token refresh on service load
secureAuthService.setupTokenRefresh();

// Export types
export type { SecureUser as User };
export type { AuthResult as SecureAuthResult };