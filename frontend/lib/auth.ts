// Simple authentication utilities
// In a real app, you'd use a proper auth service like NextAuth.js

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'developer' | 'recruiter';
  githubUsername?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Mock user database (in real app, this would be in a database)
const mockUsers: User[] = [];

// Password validation rules
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

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if email already exists
export const emailExists = (email: string): boolean => {
  return mockUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// Sign up function
export const signUp = async (
  name: string, 
  email: string, 
  password: string, 
  userType: 'developer' | 'recruiter',
  githubUsername?: string,
  company?: string
): Promise<{ success: boolean; error?: string; user?: User }> => {
  
  // Validate email
  if (!validateEmail(email)) {
    return { success: false, error: 'Invalid email format' };
  }
  
  // Check if email already exists
  if (emailExists(email)) {
    return { success: false, error: 'Email already exists' };
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { success: false, error: passwordValidation.errors.join('. ') };
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    type: userType,
    githubUsername: userType === 'developer' ? githubUsername : undefined,
    company: userType === 'recruiter' ? company : undefined,
    avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 1000)}?v=4`
  };
  
  // Add to mock database
  mockUsers.push(newUser);
  
  // Store in localStorage (in real app, use proper session management)
  localStorage.setItem('auth_user', JSON.stringify(newUser));
  
  return { success: true, user: newUser };
};

// Sign in function
export const signIn = async (
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> => {
  
  // Find user by email
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  // In real app, you'd verify the password hash
  // For demo purposes, we'll accept any password for existing users
  
  // Store in localStorage
  localStorage.setItem('auth_user', JSON.stringify(user));
  
  return { success: true, user };
};

// Sign out function
export const signOut = (): void => {
  localStorage.removeItem('auth_user');
};

// Get current user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// GitHub OAuth simulation (in real app, use proper OAuth)
export const signInWithGitHub = async (
  userType: 'developer' | 'recruiter'
): Promise<{ success: boolean; error?: string; user?: User }> => {
  
  // Simulate GitHub user data
  const githubUser = {
    name: 'GitHub User',
    email: 'github.user@example.com',
    githubUsername: 'githubuser',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
  };
  
  // Check if user already exists
  let user = mockUsers.find(u => u.email === githubUser.email);
  
  if (!user) {
    // Create new user
    user = {
      id: Date.now().toString(),
      name: githubUser.name,
      email: githubUser.email,
      type: userType,
      githubUsername: githubUser.githubUsername,
      avatarUrl: githubUser.avatarUrl
    };
    
    mockUsers.push(user);
  }
  
  // Store in localStorage
  localStorage.setItem('auth_user', JSON.stringify(user));
  
  return { success: true, user };
};
