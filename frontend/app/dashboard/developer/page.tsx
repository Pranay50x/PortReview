'use client';

import { useState, useEffect } from 'react';
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
  Mail
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthGuard from '@/components/AuthGuard';
import { getCurrentUser, User as AuthUser } from '@/lib/auth';

interface GitHubStats {
  public_repos: number;
  followers: number;
  following: number;
  total_commits: number;
  languages: Record<string, number>;
}

function DeveloperDashboardContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser?.github_username) {
      loadGitHubStats(currentUser.github_username);
    } else {
      setLoading(false);
    }
  }, []);

  const loadGitHubStats = async (username: string) => {
    try {
      // Mock GitHub stats for demo - replace with actual API call
      const stats: GitHubStats = {
        public_repos: 25,
        followers: 150,
        following: 89,
        total_commits: 1250,
        languages: {
          JavaScript: 45,
          TypeScript: 30,
          Python: 15,
          React: 10
        }
      };
      setGithubStats(stats);
    } catch (error) {
      console.error('Failed to load GitHub stats:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
                <p className="text-slate-400">Developer Dashboard</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-slate-600 text-slate-200">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-7xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="bg-gradient-to-r from-cyan-800/50 to-cyan-700/50 border-cyan-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Repositories</p>
                    <p className="text-cyan-50 text-2xl font-bold">{githubStats?.public_repos || 0}</p>
                  </div>
                  <Github className="w-8 h-8 text-cyan-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-800/50 to-green-700/50 border-green-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Followers</p>
                    <p className="text-green-50 text-2xl font-bold">{githubStats?.followers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-800/50 to-purple-700/50 border-purple-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Commits</p>
                    <p className="text-purple-50 text-2xl font-bold">{githubStats?.total_commits || 0}</p>
                  </div>
                  <GitBranch className="w-8 h-8 text-purple-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-800/50 to-orange-700/50 border-orange-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Profile Completion</p>
                    <p className="text-orange-50 text-2xl font-bold">{Math.round(profileCompletion)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    {user?.github_username && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Github className="w-4 h-4" />
                        <span className="text-sm">{user.github_username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                    {user?.company && (
                      <div className="flex items-center gap-3 text-slate-300">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{user.company}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Profile Completion</span>
                      <span className="text-sm text-cyan-400">{Math.round(profileCompletion)}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage your developer profile and portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-cyan-500 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Career Suggestions</h3>
                          <p className="text-slate-400 text-sm">Get personalized career advice</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                        onClick={() => window.location.href = '/ai-suggestions'}
                      >
                        Get Suggestions
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Create Portfolio</h3>
                          <p className="text-slate-400 text-sm">Build your showcase</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => window.location.href = '/portfolio/create'}
                      >
                        Create Portfolio
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-green-500 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Analytics</h3>
                          <p className="text-slate-400 text-sm">Track your progress</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-green-600 hover:green-700"
                        onClick={() => window.location.href = '/test-analytics'}
                      >
                        View Analytics
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-orange-500 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Browse Reviews</h3>
                          <p className="text-slate-400 text-sm">See portfolio feedback</p>
                        </div>
                      </div>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Browse Reviews
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Programming Languages */}
          {githubStats?.languages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Programming Languages
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your most used programming languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(githubStats.languages).map(([lang, percentage]) => (
                      <div key={lang} className="text-center">
                        <div className="mb-2">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {percentage}%
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                          {lang}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
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
