'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DeveloperDashboard() {
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user data and portfolio from API
    // This is mock data for now
    const mockUser = {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      githubUsername: 'alexjohnson',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
    };

    const mockPortfolio = {
      id: '1',
      title: 'Full-Stack Developer Portfolio',
      description: 'Passionate about creating scalable web applications',
      githubStats: {
        totalCommits: 1250,
        totalRepos: 45,
        followers: 123,
        following: 89,
        languages: {
          'JavaScript': 35,
          'TypeScript': 25,
          'Python': 20,
          'Go': 15,
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
        codeQualityScore: 87,
        strengthAreas: ['Frontend Development', 'API Design', 'Code Organization'],
        improvementAreas: ['Testing', 'Documentation', 'DevOps'],
        careerSuggestions: ['Senior Frontend Engineer', 'Full-Stack Architect']
      },
      projects: [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with React and Node.js',
          stars: 45,
          forks: 12,
          languages: ['TypeScript', 'React', 'Node.js'],
          complexity: 'High'
        },
        {
          id: '2',
          name: 'Task Management App',
          description: 'Collaborative task management with real-time updates',
          stars: 23,
          forks: 8,
          languages: ['JavaScript', 'Vue.js', 'Express'],
          complexity: 'Medium'
        }
      ]
    };

    setTimeout(() => {
      setUser(mockUser);
      setPortfolio(mockPortfolio);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                PortReviewer
              </Link>
              <Badge variant="secondary">Developer</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/portfolio/create">Create Portfolio</Link>
              </Button>
              <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{user?.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your developer portfolio and insights
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Portfolio Views</CardDescription>
              <CardTitle className="text-2xl text-blue-600">1,247</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">+12% this month</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Code Quality Score</CardDescription>
              <CardTitle className="text-2xl text-green-600">{portfolio?.aiInsights.codeQualityScore}/100</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">Excellent</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>GitHub Commits</CardDescription>
              <CardTitle className="text-2xl text-purple-600">{portfolio?.githubStats.totalCommits.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">+89 this week</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recruiter Interest</CardDescription>
              <CardTitle className="text-2xl text-orange-600">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">5 new views today</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Portfolio Overview
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portfolio/edit">Edit</Link>
                  </Button>
                </CardTitle>
                <CardDescription>{portfolio?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio?.skills.map((skill: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant={skill.verified ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {skill.name} {skill.level}%
                        {skill.verified && ' ✓'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recent Projects</h4>
                  <div className="space-y-2">
                    {portfolio?.projects.map((project: any) => (
                      <div key={project.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{project.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {project.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>⭐ {project.stars}</span>
                          <span>🍴 {project.forks}</span>
                          <div className="flex gap-1">
                            {project.languages.slice(0, 3).map((lang: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
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
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🤖 AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                  <ul className="text-sm space-y-1">
                    {portfolio?.aiInsights.strengthAreas.map((area: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2">Growth Areas</h4>
                  <ul className="text-sm space-y-1">
                    {portfolio?.aiInsights.improvementAreas.map((area: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-orange-500">📈</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Career Suggestions</h4>
                  <ul className="text-sm space-y-1">
                    {portfolio?.aiInsights.careerSuggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-blue-500">💼</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/portfolio/analyze">🔍 Analyze GitHub</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/portfolio/share">🔗 Share Portfolio</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/insights">📊 View Insights</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
