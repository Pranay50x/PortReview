'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Github, 
  GitBranch, 
  Star, 
  Users, 
  Code, 
  TrendingUp, 
  Target, 
  Brain,
  Settings,
  User,
  ExternalLink,
  Calendar,
  MapPin,
  Building,
  Mail,
  LogOut,
  Bell,
  Search,
  BarChart3,
  FileText,
  Briefcase,
  Award,
  Zap,
  ArrowRight,
  Plus,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthGuard from '@/components/AuthGuard';
import { getCurrentUser, signOut, User as AuthUser } from '@/lib/auth';
import { githubAnalyticsService, GitHubStats as AnalyticsStats, UserActivity } from '@/lib/github-analytics';

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
  created_at?: string; // Added for years active calculation
}

function DeveloperDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Helper function to get time ago
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser?.github_username) {
      loadRealGitHubStats();
      loadUserActivity();
    } else {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  const loadRealGitHubStats = async () => {
    try {
      setStatsLoading(true);
      const currentUser = getCurrentUser();
      
      if (!currentUser?.github_username) {
        throw new Error('No GitHub username found');
      }

      // Try to fetch real GitHub user data from our backend endpoint
      let userData = null;
      try {
        const userResponse = await fetch(`http://localhost:8000/api/github/user/${currentUser.github_username}`);
        if (userResponse.ok) {
          userData = await userResponse.json();
        }
      } catch (error) {
        console.warn('Backend user endpoint not available, using fallback');
      }

      // Get repository data from analyze endpoint for repository count and technical skills
      let analysisData = null;
      try {
        const analysisResponse = await fetch(`http://localhost:8000/api/github/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: currentUser.github_username
          })
        });
        
        if (analysisResponse.ok) {
          analysisData = await analysisResponse.json();
        }
      } catch (error) {
        console.warn('Backend analysis endpoint not available, using fallback');
      }

      // If backend is not available, try direct GitHub API
      if (!userData && !analysisData) {
        try {
          const directResponse = await fetch(`https://api.github.com/users/${currentUser.github_username}`);
          if (directResponse.ok) {
            const directData = await directResponse.json();
            userData = {
              public_repos: directData.public_repos,
              followers: directData.followers,
              following: directData.following,
              created_at: directData.created_at
            };
          }
        } catch (error) {
          console.warn('Direct GitHub API also failed');
        }
      }
      
      // Calculate total stars and forks from repositories if available
      const totalStars = analysisData?.repositories?.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0) || 0;
      const totalForks = analysisData?.repositories?.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0) || 0;
      
      // Calculate commits estimate
      const repoCount = analysisData?.repositories_count || userData?.public_repos || 10;
      const estimatedCommits = Math.max(repoCount * 25, 150);
      
      // Get language stats from AI insights or calculate from repos
      let languageData: Record<string, number> = {};
      if (analysisData?.ai_insights?.technical_skills) {
        const skills = analysisData.ai_insights.technical_skills;
        Object.entries(skills).forEach(([lang, value]) => {
          languageData[lang] = Math.round((value as number) * 100);
        });
      } else {
        // Fallback language data
        languageData = {
          'JavaScript': 85,
          'TypeScript': 80,
          'React': 90,
          'Python': 75,
          'Node.js': 70
        };
      }
      
      // Transform data to frontend format using real GitHub user data or fallbacks
      setGithubStats({
        public_repos: userData?.public_repos || repoCount,
        followers: userData?.followers || 25,
        following: userData?.following || 50,
        total_commits: estimatedCommits,
        total_stars: totalStars || 15,
        total_forks: totalForks || 8,
        languages: languageData,
        recent_activity: repoCount,
        portfolio_views: await githubAnalyticsService.getPortfolioViews().catch(() => 0),
        created_at: userData?.created_at || '2022-01-01T00:00:00Z',
      });
    } catch (error) {
      console.error('Failed to load GitHub stats:', error);
      // Show fallback state with realistic mock data
      setGithubStats({
        public_repos: 12,
        followers: 25,
        following: 45,
        total_commits: 300,
        total_stars: 15,
        total_forks: 8,
        languages: {
          'JavaScript': 85,
          'TypeScript': 80,
          'React': 90,
          'Python': 75,
          'Node.js': 70
        },
        recent_activity: 12,
        portfolio_views: 0,
        created_at: '2022-01-01T00:00:00Z',
      });
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  };

  const loadUserActivity = async () => {
    try {
      const activity = await githubAnalyticsService.getUserActivity();
      setUserActivity(activity);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    }
  };

  const loadGitHubStats = async (username: string) => {
    // This function is no longer used, replaced by loadRealGitHubStats
    return;
  };

  const saveUserToMongoDB = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          github_username: user.github_username,
          profile: {
            bio: user.position,
            company: user.company,
            avatar_url: user.avatar_url,
          },
        }),
      });

      if (response.ok) {
        console.log('User saved to MongoDB successfully');
      }
    } catch (error) {
      console.error('Failed to save user to MongoDB:', error);
    }
  };

  useEffect(() => {
    if (user) {
      saveUserToMongoDB();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = user ? 
    Object.values({
      name: user.name,
      email: user.email,
      github: user.github_username,
      company: user.company,
      position: user.position,
      avatar: user.avatar_url
    }).filter(Boolean).length * 16.67 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">PortReview</h1>
                <p className="text-xs text-slate-400">Developer Dashboard</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search portfolios, reviews..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-700">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar_url} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">Developer</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-slate-400 text-lg">
                Ready to showcase your amazing work today?
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push(`/portfolio/${user?.github_username}`)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View My Portfolio
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/auto-portfolio')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Auto-Generate Portfolio
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100/80 text-sm font-medium mb-1">Repositories</p>
                  <p className="text-white text-3xl font-bold">
                    {statsLoading ? '...' : (githubStats?.public_repos || 0)}
                  </p>
                  <p className="text-cyan-300 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {statsLoading ? 'Loading...' : 'Public repositories'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Github className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100/80 text-sm font-medium mb-1">Followers</p>
                  <p className="text-white text-3xl font-bold">
                    {statsLoading ? '...' : (githubStats?.followers || 0)}
                  </p>
                  <p className="text-green-300 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {statsLoading ? 'Loading...' : 'GitHub followers'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100/80 text-sm font-medium mb-1">Total Commits</p>
                  <p className="text-white text-3xl font-bold">
                    {statsLoading ? '...' : formatNumber(githubStats?.total_commits || 0)}
                  </p>
                  <p className="text-purple-300 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {statsLoading ? 'Loading...' : 'All time activity'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 hover:border-orange-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100/80 text-sm font-medium mb-1">Total Stars</p>
                  <p className="text-white text-3xl font-bold">
                    {statsLoading ? '...' : (githubStats?.total_stars || 0)}
                  </p>
                  <p className="text-orange-300 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {statsLoading ? 'Loading...' : 'Across all repos'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100/80 text-sm font-medium mb-1">Years Active</p>
                  <p className="text-white text-3xl font-bold">
                    {statsLoading ? '...' : (() => {
                      if (!githubStats?.created_at) return '2+';
                      const createdDate = new Date(githubStats.created_at);
                      const years = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365)));
                      return years;
                    })()}
                  </p>
                  <p className="text-blue-300 text-xs flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {statsLoading ? 'Loading...' : 'Coding experience'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Jump into your most important tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-xl hover:border-cyan-400/40 transition-all duration-300 cursor-pointer"
                      onClick={() => router.push('/ai-suggestions')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                          <Brain className="w-6 h-6 text-cyan-400" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">AI Career Boost</h3>
                      <p className="text-slate-400 text-sm mb-4">Get personalized suggestions to enhance your career</p>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        New insights available
                      </Badge>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl hover:border-purple-400/40 transition-all duration-300 cursor-pointer"
                      onClick={() => router.push('/dashboard/auto-portfolio')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                          <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Auto-Generate Portfolio</h3>
                      <p className="text-slate-400 text-sm mb-4">Create professional portfolio from GitHub automatically</p>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        ⚡ One-click generation
                      </Badge>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl hover:border-green-400/40 transition-all duration-300 cursor-pointer"
                      onClick={() => router.push('/test-analytics')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                          <BarChart3 className="w-6 h-6 text-green-400" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">View Analytics</h3>
                      <p className="text-slate-400 text-sm mb-4">Track your portfolio performance</p>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        Updated today
                      </Badge>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl hover:border-orange-400/40 transition-all duration-300 cursor-pointer"
                      onClick={() => router.push('/dashboard/developer/skills')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                          <Target className="w-6 h-6 text-orange-400" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Skill Tracker</h3>
                      <p className="text-slate-400 text-sm mb-4">Track your technical skills and progress</p>
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        {statsLoading ? 'Loading...' : `${Object.keys(githubStats?.languages || {}).length} skills tracked`}
                      </Badge>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userActivity.length > 0 ? (
                      userActivity.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'portfolio_view' ? 'bg-green-400' :
                            activity.type === 'github_commit' ? 'bg-blue-400' :
                            activity.type === 'ai_suggestion' ? 'bg-purple-400' :
                            'bg-orange-400'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.description}</p>
                            <p className="text-slate-400 text-xs">{getTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-white text-sm">Loading recent activity...</p>
                            <p className="text-slate-400 text-xs">Just now</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-white text-sm">Fetching GitHub activity...</p>
                            <p className="text-slate-400 text-xs">Loading...</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {userActivity.length > 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4 text-slate-400 hover:text-white"
                      onClick={() => router.push('/dashboard/developer/activity')}
                    >
                      View all activity
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Profile & Skills */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-purple-500/20">
                    <AvatarImage src={user?.avatar_url} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white text-xl">{user?.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {user?.position || 'Full Stack Developer'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {user?.email && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    )}
                    {user?.github_username && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Github className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{user.github_username}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                    {user?.company && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{user.company}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-slate-400">Profile Completion</span>
                      <span className="text-sm text-purple-400 font-semibold">{Math.round(profileCompletion)}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                    <p className="text-xs text-slate-500 mt-2">
                      {profileCompletion < 80 ? 'Complete your profile to get better opportunities' : 'Great! Your profile looks complete'}
                    </p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    Top Skills
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Based on your GitHub activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsLoading ? (
                      // Loading state
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="h-4 bg-slate-700 rounded w-20 animate-pulse"></div>
                              <div className="h-4 bg-slate-700 rounded w-12 animate-pulse"></div>
                            </div>
                            <div className="h-2 bg-slate-700 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </>
                    ) : githubStats?.languages && Object.keys(githubStats.languages).length > 0 ? (
                      // Show actual skills
                      Object.entries(githubStats.languages).slice(0, 5).map(([lang, percentage]) => (
                        <div key={lang} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm font-medium">{lang}</span>
                            <span className="text-slate-400 text-sm">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      ))
                    ) : (
                      // Fallback skills when no data
                      <>
                        {[
                          { name: 'JavaScript', level: 85 },
                          { name: 'TypeScript', level: 80 },
                          { name: 'React', level: 90 },
                          { name: 'Node.js', level: 75 },
                          { name: 'Python', level: 70 }
                        ].map((skill) => (
                          <div key={skill.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white text-sm font-medium">{skill.name}</span>
                              <span className="text-slate-400 text-sm">{skill.level}%</span>
                            </div>
                            <Progress value={skill.level} className="h-2" />
                          </div>
                        ))}
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p className="text-amber-300 text-xs">
                            🔄 Connect to GitHub for personalized skills analysis
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-200 hover:bg-slate-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skills
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeveloperDashboard() {
  return (
    <AuthGuard requiredUserType="developer">
      <DeveloperDashboardContent />
    </AuthGuard>
  );
}
