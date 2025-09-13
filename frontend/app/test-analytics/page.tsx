'use client';

import { PortfolioAnalytics } from '@/components/PortfolioAnalytics';
import { secureAuthService, type SecureUser } from '@/lib/auth-secure';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, GitBranch, Eye, Calendar, Users } from 'lucide-react';

interface GitHubStats {
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  created_at: string;
}

export default function TestAnalyticsPage() {
  const [user, setUser] = useState<SecureUser | null>(null);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await secureAuthService.getCurrentUser();
        setUser(currentUser);
        if (currentUser?.github_username) {
          fetchGitHubStats(currentUser.github_username);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const fetchGitHubStats = async (githubUsername: string) => {
    try {
      // Fetch GitHub user data
      const response = await fetch(`https://api.github.com/users/${githubUsername}`);
      if (response.ok) {
        const data = await response.json();
        
        setGithubStats({
          public_repos: data.public_repos,
          followers: data.followers,
          following: data.following,
          total_stars: 0, // We'll calculate this from repositories
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-white text-2xl font-bold mb-4">Please Log In</h1>
            <p className="text-slate-400 mb-8">You need to be logged in to view analytics</p>
            <Button onClick={() => router.push('/auth/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/developer')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-white text-3xl font-bold">Portfolio Analytics</h1>
              <p className="text-slate-400">Track your portfolio performance and engagement</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-slate-400 text-sm">@{user.github_username}</p>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {user.github_username ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg p-6 hover:bg-blue-900/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Repositories</p>
                    <p className="text-white text-3xl font-bold">{loading ? '...' : githubStats?.public_repos || 0}</p>
                  </div>
                  <GitBranch className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-blue-400 text-sm mt-3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Public repositories
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-6 hover:bg-green-900/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Followers</p>
                    <p className="text-white text-3xl font-bold">{loading ? '...' : githubStats?.followers || 0}</p>
                  </div>
                  <Users className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-green-400 text-sm mt-3 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  GitHub followers
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-6 hover:bg-purple-900/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Following</p>
                    <p className="text-white text-3xl font-bold">{loading ? '...' : githubStats?.following || 0}</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-400" />
                </div>
                <p className="text-purple-400 text-sm mt-3 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Following others
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-700/50 rounded-lg p-6 hover:bg-cyan-900/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-300 text-sm font-medium">Years Active</p>
                    <p className="text-white text-3xl font-bold">
                      {loading ? '...' : githubStats ? Math.max(1, Math.floor((Date.now() - new Date(githubStats.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))) : 0}
                    </p>
                  </div>
                  <Calendar className="w-10 h-10 text-cyan-400" />
                </div>
                <p className="text-cyan-400 text-sm mt-3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  On GitHub
                </p>
              </div>
            </div>

            {/* Main Analytics Component */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-white text-2xl font-bold mb-2">
                    Portfolio Performance for @{user.github_username}
                  </h2>
                  <p className="text-slate-400">
                    AI-powered insights and analytics for your developer portfolio
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => window.open(`/portfolio/${user.github_username}`, '_blank')}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                </div>
              </div>
              <PortfolioAnalytics githubUsername={user.github_username} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-white text-xl font-semibold mb-4">GitHub Account Not Connected</h2>
            <p className="text-slate-400 mb-8">
              Connect your GitHub account to view detailed analytics
            </p>
            <Button onClick={() => router.push('/dashboard/developer')}>
              Connect GitHub Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
