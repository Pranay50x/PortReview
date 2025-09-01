export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'developer' | 'recruiter';
  githubUsername?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Developer extends User {
  githubUrl?: string;
  skills: string[];
  experience: string;
  portfolio?: Portfolio;
}

export interface Recruiter extends User {
  company: string;
  position: string;
  reviews: Review[];
}

export interface Portfolio {
  id: string;
  developerId: string;
  title: string;
  description: string;
  githubStats: GitHubStats;
  projects: Project[];
  skills: Skill[];
  aiInsights: AIInsights;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubStats {
  totalCommits: number;
  totalRepos: number;
  followers: number;
  following: number;
  languages: Record<string, number>;
  contributions: number[];
  profileViews?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  languages: string[];
  stars: number;
  forks: number;
  complexity: 'Low' | 'Medium' | 'High';
  codeQuality: number;
  lastUpdated: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
  verified: boolean;
  yearsOfExperience?: number;
}

export interface AIInsights {
  strengthAreas: string[];
  improvementAreas: string[];
  careerSuggestions: string[];
  techTrends: string[];
  collaborationPattern: string;
  codeQualityScore: number;
  learningPath: string[];
}

export interface Review {
  id: string;
  recruiterId: string;
  portfolioId: string;
  rating: number;
  feedback: string;
  isAnonymous: boolean;
  skills: string[];
  createdAt: string;
}

export interface GitHubAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
