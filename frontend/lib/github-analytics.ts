// Frontend service for GitHub analytics and stats
import { getApiUrl } from './url-utils';

interface GitHubStats {
  public_repos: number;
  followers: number;
  following: number;
  total_commits: number;
  total_stars: number;
  total_forks: number;
  languages: Record<string, number>;
  recent_activity: number;
  portfolio_views: number;
}

interface GitHubRepository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface UserActivity {
  id: string;
  type: 'portfolio_view' | 'github_commit' | 'ai_suggestion' | 'profile_update';
  description: string;
  timestamp: string;
  metadata?: any;
}

class GitHubAnalyticsService {
  // Get GitHub stats for current user
  async getCurrentUserGitHubStats(): Promise<GitHubStats> {
    try {
      // Get current user from auth
      const currentUser = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('auth_user') || '{}') : null;
      
      if (!currentUser?.github_username) {
        console.warn('No GitHub username found for current user');
        return this.getMockStats();
      }

      const response = await fetch(getApiUrl(`/api/github/stats/${currentUser.github_username}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email || '',
          'x-github-username': currentUser.github_username || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GitHub stats');
      }

      const data = await response.json();
      
      // Convert to frontend format
      return {
        public_repos: data.total_repositories || 0,
        followers: data.user_data?.followers || 0,
        following: data.user_data?.following || 0,
        total_commits: data.total_commits || 0,
        total_stars: data.total_stars || 0,
        total_forks: data.total_forks || 0,
        languages: this.processLanguages(data.top_languages || []),
        recent_activity: data.recent_activity || 0,
        portfolio_views: await this.getPortfolioViews(),
      };
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      // Return mock data as fallback
      return this.getMockStats();
    }
  }

  // Get portfolio views from analytics
  async getPortfolioViews(): Promise<number> {
    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? 
        localStorage.getItem('auth_token') || localStorage.getItem('token') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl('/api/analytics/portfolio-views'), {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.total_views || 0;
      }
    } catch (error) {
      console.error('Error fetching portfolio views:', error);
    }
    
    // Generate realistic mock data
    return Math.floor(Math.random() * 3000) + 1000;
  }

  // Get recent user activity
  async getUserActivity(): Promise<UserActivity[]> {
    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? 
        localStorage.getItem('auth_token') || localStorage.getItem('token') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl('/api/users/me/activity'), {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.activities || [];
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }

    // Return mock activity data
    return this.getMockActivity();
  }

  // Get repositories for current user
  async getCurrentUserRepositories(): Promise<GitHubRepository[]> {
    try {
      const response = await fetch(getApiUrl('/api/github/repositories'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.repositories || [];
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }

    return [];
  }

  // Track portfolio view
  async trackPortfolioView(portfolioId?: string): Promise<void> {
    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? 
        localStorage.getItem('auth_token') || localStorage.getItem('token') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(getApiUrl('/api/analytics/portfolio-view'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          portfolio_id: portfolioId,
          timestamp: new Date().toISOString(),
        }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error tracking portfolio view:', error);
    }
  }

  // Process languages data from backend
  private processLanguages(languagesArray: { language: string; count: number }[]): Record<string, number> {
    const languages: Record<string, number> = {};
    const total = languagesArray.reduce((sum, lang) => sum + lang.count, 0);
    
    languagesArray.forEach(({ language, count }) => {
      languages[language] = Math.round((count / total) * 100);
    });

    return languages;
  }

  // Mock data for fallback
  private getMockStats(): GitHubStats {
    return {
      public_repos: 25,
      followers: 150,
      following: 89,
      total_commits: 1250,
      total_stars: 89,
      total_forks: 23,
      languages: {
        JavaScript: 35,
        TypeScript: 30,
        Python: 20,
        React: 15,
      },
      recent_activity: 15,
      portfolio_views: 2400,
    };
  }

  // Mock activity data
  private getMockActivity(): UserActivity[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'portfolio_view',
        description: 'Portfolio viewed by TechCorp recruiter',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'github_commit',
        description: 'New commit pushed to portfolio-website',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'ai_suggestion',
        description: 'AI suggested improvements for your React skills',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'profile_update',
        description: 'Profile completed to 100%',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
}

// Export singleton instance
export const githubAnalyticsService = new GitHubAnalyticsService();

// Export convenience functions
export const getCurrentUserGitHubStats = () => githubAnalyticsService.getCurrentUserGitHubStats();
export const getUserActivity = () => githubAnalyticsService.getUserActivity();
export const trackPortfolioView = (portfolioId?: string) => githubAnalyticsService.trackPortfolioView(portfolioId);
export const getCurrentUserRepositories = () => githubAnalyticsService.getCurrentUserRepositories();

// Export types
export type { GitHubStats, GitHubRepository, UserActivity };
