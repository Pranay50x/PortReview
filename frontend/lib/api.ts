// API service for connecting to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: string;
  name: string;
  email: string;
  user_type: 'developer' | 'recruiter';
  github_username?: string;
  company?: string;
  position?: string;
  avatar_url?: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

export interface AIInsights {
  code_quality_score: number;
  technical_skills: Record<string, number>;
  experience_level: string;
  strengths: string[];
  recommendations: string[];
}

class APIService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
    user_type: 'developer' | 'recruiter';
    github_username?: string;
    company?: string;
  }): Promise<{ user: User; access_token: string }> {
    const response = await this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.token = response.access_token;
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(response.user));

    return response;
  }

  async signIn(email: string, password: string): Promise<{ user: User; access_token: string }> {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.access_token;
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(response.user));

    return response;
  }

  // GitHub OAuth
  async githubCallback(code: string, userType: string): Promise<{ user: User; access_token: string }> {
    const response = await this.makeRequest('/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code, userType }),
    });

    this.token = response.access_token;
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(response.user));

    return response;
  }

  signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.getCurrentUser() !== null;
  }

  // GitHub Analysis - AI feature
  async analyzeGitHubProfile(username: string): Promise<{
    repositories: GitHubRepo[];
    ai_insights: AIInsights;
  }> {
    return this.makeRequest('/github/analyze', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }
}

export const apiService = new APIService();

// Compatibility functions
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

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const signUp = async (
  name: string, 
  email: string, 
  password: string, 
  userType: 'developer' | 'recruiter',
  githubUsername?: string,
  company?: string
): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('. ') };
    }

    const response = await apiService.signUp({
      name,
      email,
      password,
      user_type: userType,
      github_username: githubUsername,
      company,
    });

    return { success: true, user: response.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const response = await apiService.signIn(email, password);
    return { success: true, user: response.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signOut = (): void => {
  apiService.signOut();
};

export const getCurrentUser = (): User | null => {
  return apiService.getCurrentUser();
};

export const isAuthenticated = (): boolean => {
  return apiService.isAuthenticated();
};

// GitHub OAuth for Next.js API route
export const handleGitHubCallback = async (code: string, userType: string): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const response = await apiService.githubCallback(code, userType);
    return { success: true, user: response.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// For backward compatibility
export type { User as AuthUser };
