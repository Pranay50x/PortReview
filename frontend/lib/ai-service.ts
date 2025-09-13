// AI Service for connecting only AI features to Python backend
// Authentication is handled locally in Next.js

const AI_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  stargazers_count?: number;
  forks: number;
  forks_count?: number;
  url: string;
  html_url?: string;
  clone_url?: string;
  full_name?: string;
  id?: number;
}

export interface AIInsights {
  code_quality_score: number;
  technical_skills: Record<string, number>;
  experience_level: string;
  strengths: string[];
  recommendations: string[];
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description: string;
  skills: string[];
  projects: Project[];
  github_repositories?: GitHubRepo[];
  ai_insights?: AIInsights;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
}

class AIService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${AI_API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

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

  // GitHub Analysis - Main AI feature
  async analyzeGitHubProfile(username: string): Promise<{
    repositories: GitHubRepo[];
    ai_insights: AIInsights;
  }> {
    return this.makeRequest('/api/github/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  // Portfolio Analysis
  async analyzePortfolio(portfolioData: {
    github_username: string;
    skills: string[];
    projects: Project[];
  }): Promise<{ ai_insights: AIInsights }> {
    return this.makeRequest('/portfolio/analyze', {
      method: 'POST',
      body: JSON.stringify(portfolioData),
    });
  }

  // Code Quality Analysis
  async analyzeCodeQuality(repoUrl: string): Promise<{
    quality_score: number;
    metrics: Record<string, number>;
    suggestions: string[];
  }> {
    return this.makeRequest('/code/analyze', {
      method: 'POST',
      body: JSON.stringify({ repo_url: repoUrl }),
    });
  }

  // Skill Assessment
  async assessSkills(githubUsername: string): Promise<{
    skills: Record<string, number>;
    experience_level: string;
    recommendations: string[];
  }> {
    return this.makeRequest('/skills/assess', {
      method: 'POST',
      body: JSON.stringify({ github_username: githubUsername }),
    });
  }

  // Career Recommendations
  async getCareerRecommendations(profile: {
    skills: string[];
    experience_level: string;
    github_stats: any;
  }): Promise<{
    career_paths: string[];
    skill_gaps: string[];
    learning_resources: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  }> {
    return this.makeRequest('/career/recommendations', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // Repository Insights
  async getRepositoryInsights(repoUrl: string): Promise<{
    complexity: string;
    maintainability: number;
    documentation_quality: number;
    test_coverage_estimate: number;
    technologies_used: string[];
    recommendations: string[];
  }> {
    return this.makeRequest('/repository/insights', {
      method: 'POST',
      body: JSON.stringify({ repo_url: repoUrl }),
    });
  }
}

export const aiService = new AIService();
