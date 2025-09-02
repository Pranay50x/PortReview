'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Bot, TrendingUp, Search, Link as LinkIcon, BarChart3 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { PortfolioAnalytics } from '@/components/PortfolioAnalytics';
import { getCurrentUser, signOut, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function DeveloperDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Generate portfolio data based on user
      const mockPortfolio = {
        id: '1',
        title: `${currentUser.name} - Developer Portfolio`,
        description: 'Building amazing web applications with modern technologies',
        githubStats: {
          totalCommits: Math.floor(Math.random() * 2000) + 500,
          totalRepos: Math.floor(Math.random() * 50) + 10,
          followers: Math.floor(Math.random() * 200) + 50,
          following: Math.floor(Math.random() * 150) + 30,
          languages: {
            'JavaScript': 35,
            'TypeScript': 28,
            'Python': 20,
            'Go': 12,
            'Other': 5
          }
        },
        skills: [
          { name: 'React', level: 90, category: 'Frontend', verified: true },
          { name: 'Node.js', level: 85, category: 'Backend', verified: true },
          { name: 'TypeScript', level: 88, category: 'Language', verified: true },
          { name: 'PostgreSQL', level: 75, category: 'Database', verified: false }
        ],
        aiInsights: {
          codeQualityScore: Math.floor(Math.random() * 20) + 80,
          strengthAreas: ['Frontend Development', 'API Design', 'Code Organization'],
          improvementAreas: ['Testing', 'Documentation', 'DevOps'],
          careerSuggestions: ['Senior Frontend Engineer', 'Full-Stack Architect']
        },
        projects: [
          {
            id: '1',
            name: 'E-commerce Platform',
            description: 'Full-stack e-commerce solution with React and Node.js',
            stars: Math.floor(Math.random() * 100) + 20,
            forks: Math.floor(Math.random() * 30) + 5,
            languages: ['TypeScript', 'React', 'Node.js'],
            complexity: 'High'
          },
          {
            id: '2',
            name: 'Task Management App',
            description: 'Collaborative task management with real-time updates',
            stars: Math.floor(Math.random() * 50) + 10,
            forks: Math.floor(Math.random() * 20) + 3,
            languages: ['JavaScript', 'Vue.js', 'Express'],
            complexity: 'Medium'
          }
        ]
      };

      setTimeout(() => {
        setPortfolio(mockPortfolio);
        setLoading(false);
      }, 1000);
    }
  }, []);

  const handleSignOut = () => {
    signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-slate-300">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-cyan-400">
                PortReviewer
              </Link>
              <Badge variant="secondary" className="bg-cyan-900/50 text-cyan-300 border-cyan-700/50">
                Developer
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-300 hover:text-cyan-400" asChild>
                <Link href="/portfolio/create">Create Portfolio</Link>
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-red-400" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
              <Avatar className="border-2 border-cyan-500/30">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="bg-slate-800 text-cyan-400">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0]}!
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-300 mt-2">
            Here's an overview of your developer portfolio and insights
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Portfolio Views</CardDescription>
              <CardTitle className="text-2xl text-cyan-400">1,247</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">+12% this month</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Code Quality Score</CardDescription>
              <CardTitle className="text-2xl text-green-400">{portfolio?.aiInsights.codeQualityScore}/100</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">Excellent</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">GitHub Commits</CardDescription>
              <CardTitle className="text-2xl text-purple-400">{portfolio?.githubStats.totalCommits.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">+89 this week</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Recruiter Interest</CardDescription>
              <CardTitle className="text-2xl text-orange-400">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">5 new views today</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  Portfolio Overview
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" asChild>
                    <Link href="/portfolio/edit">Edit</Link>
                  </Button>
                </CardTitle>
                <CardDescription className="text-slate-300">{portfolio?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-white">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio?.skills.map((skill: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant={skill.verified ? "default" : "secondary"}
                        className={`text-xs ${
                          skill.verified 
                            ? 'bg-cyan-600 text-white' 
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                      >
                        {skill.name} {skill.level}%
                        {skill.verified && ' ✓'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-white">Recent Projects</h4>
                  <div className="space-y-2">
                    {portfolio?.projects.map((project: any) => (
                      <div key={project.id} className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-white">{project.name}</h5>
                          <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                            {project.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{project.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {project.stars}
                          </span>
                          <span>🍴 {project.forks}</span>
                          <div className="flex gap-1">
                            {project.languages.slice(0, 3).map((lang: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-slate-600 text-slate-300 border-slate-500">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Portfolio Analytics */}
            <PortfolioAnalytics githubUsername={user?.github_username} />

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white" variant="outline" asChild>
                  <Link href="/portfolio/analyze" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Analyze GitHub
                  </Link>
                </Button>
                <Button className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" variant="outline" asChild>
                  <Link href="/portfolio/share" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Share Portfolio
                  </Link>
                </Button>
                <Button className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" variant="outline" asChild>
                  <Link href="/insights" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Insights
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
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
