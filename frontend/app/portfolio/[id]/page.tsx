'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PortfolioView() {
  const params = useParams();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch portfolio data from API using params.id
    // This is mock data for now
    const mockPortfolio = {
      id: params.id,
      title: 'Alex Johnson - Full-Stack Developer',
      description: 'Passionate developer with 5+ years of experience building scalable web applications',
      developer: {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        githubUsername: 'alexjohnson',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        location: 'San Francisco, CA',
        experience: '5 years'
      },
      githubStats: {
        totalCommits: 2845,
        totalRepos: 34,
        followers: 234,
        following: 123,
        languages: {
          'JavaScript': 35,
          'TypeScript': 28,
          'Python': 20,
          'Go': 12,
          'Other': 5
        }
      },
      projects: [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'A full-stack e-commerce solution built with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, inventory management, and real-time notifications.',
          githubUrl: 'https://github.com/alexjohnson/ecommerce',
          liveUrl: 'https://ecommerce-demo.vercel.app',
          languages: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
          stars: 89,
          forks: 23,
          complexity: 'High',
          codeQuality: 92,
          lastUpdated: '2024-08-15'
        },
        {
          id: '2',
          name: 'Task Management App',
          description: 'Real-time collaborative task management application with WebSocket integration, drag-and-drop functionality, and team collaboration features.',
          githubUrl: 'https://github.com/alexjohnson/taskapp',
          liveUrl: 'https://taskapp-demo.vercel.app',
          languages: ['Vue.js', 'Express', 'MongoDB', 'Socket.io'],
          stars: 45,
          forks: 12,
          complexity: 'Medium',
          codeQuality: 87,
          lastUpdated: '2024-07-22'
        },
        {
          id: '3',
          name: 'Weather Dashboard',
          description: 'Beautiful weather dashboard with location-based forecasts, interactive maps, and weather alerts. Built with modern React patterns and responsive design.',
          githubUrl: 'https://github.com/alexjohnson/weather-app',
          liveUrl: 'https://weather-dashboard-demo.vercel.app',
          languages: ['React', 'TypeScript', 'TailwindCSS'],
          stars: 67,
          forks: 18,
          complexity: 'Low',
          codeQuality: 89,
          lastUpdated: '2024-08-01'
        }
      ],
      skills: [
        { name: 'React', level: 95, category: 'Frontend', verified: true, yearsOfExperience: 4 },
        { name: 'Node.js', level: 90, category: 'Backend', verified: true, yearsOfExperience: 4 },
        { name: 'TypeScript', level: 88, category: 'Language', verified: true, yearsOfExperience: 3 },
        { name: 'PostgreSQL', level: 82, category: 'Database', verified: true, yearsOfExperience: 3 },
        { name: 'AWS', level: 75, category: 'Cloud', verified: false, yearsOfExperience: 2 },
        { name: 'Docker', level: 78, category: 'DevOps', verified: false, yearsOfExperience: 2 }
      ],
      aiInsights: {
        codeQualityScore: 89,
        strengthAreas: ['Frontend Architecture', 'API Design', 'Code Organization', 'Performance Optimization'],
        improvementAreas: ['Testing Coverage', 'Documentation', 'DevOps Practices'],
        careerSuggestions: ['Senior Frontend Engineer', 'Full-Stack Team Lead', 'Technical Architect'],
        collaborationPattern: 'Strong team player with excellent code review practices',
        learningPath: ['Advanced Testing Strategies', 'Microservices Architecture', 'System Design']
      },
      isPublic: true,
      createdAt: '2024-06-15',
      updatedAt: '2024-08-20'
    };

    setTimeout(() => {
      setPortfolio(mockPortfolio);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-gray-600">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">Portfolio not found</div>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              PortReviewer
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/login">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={portfolio.developer.avatarUrl} alt={portfolio.developer.name} />
            <AvatarFallback className="text-2xl">
              {portfolio.developer.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{portfolio.developer.name}</h1>
          <p className="text-xl text-gray-600 mb-4">{portfolio.description}</p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
            <span>📍 {portfolio.developer.location}</span>
            <span>💼 {portfolio.developer.experience}</span>
            <span>⭐ {portfolio.aiInsights.codeQualityScore}/100 Code Quality</span>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href={`https://github.com/${portfolio.developer.githubUsername}`} target="_blank">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View GitHub
              </Link>
            </Button>
            <Button variant="outline">Contact Developer</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Projects Section */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Projects</CardTitle>
                <CardDescription>
                  {portfolio.projects.length} projects showcasing technical expertise and creativity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {portfolio.projects.map((project: any) => (
                  <Card key={project.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-gray-600 mb-4">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge 
                            variant={project.complexity === 'High' ? 'default' : project.complexity === 'Medium' ? 'secondary' : 'outline'}
                          >
                            {project.complexity}
                          </Badge>
                          <Badge variant="outline">
                            {project.codeQuality}/100
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          ⭐ {project.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          🍴 {project.forks}
                        </span>
                        <span>Updated {new Date(project.lastUpdated).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.languages.map((lang: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button size="sm" asChild>
                          <Link href={project.githubUrl} target="_blank">
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            Code
                          </Link>
                        </Button>
                        {project.liveUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={project.liveUrl} target="_blank">
                              🌐 Live Demo
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of coding style, strengths, and growth opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">💪 Key Strengths</h4>
                    <div className="space-y-2">
                      {portfolio.aiInsights.strengthAreas.map((area: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-3">📈 Growth Areas</h4>
                    <div className="space-y-2">
                      {portfolio.aiInsights.improvementAreas.map((area: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-orange-500">📋</span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">🎯 Career Recommendations</h4>
                  <div className="grid gap-2">
                    {portfolio.aiInsights.careerSuggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                        💼 {suggestion}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-600 mb-3">🚀 Learning Path</h4>
                  <div className="grid gap-2">
                    {portfolio.aiInsights.learningPath.map((path: string, index: number) => (
                      <div key={index} className="p-3 bg-purple-50 rounded-lg text-sm">
                        📚 {path}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolio.skills.map((skill: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        {skill.name}
                        {skill.verified && <span className="text-green-500 text-xs">✓</span>}
                      </span>
                      <span className="text-xs text-gray-500">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {skill.yearsOfExperience} years experience
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* GitHub Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GitHub Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{portfolio.githubStats.totalRepos}</div>
                    <div className="text-xs text-gray-600">Repositories</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{portfolio.githubStats.totalCommits.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Commits</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{portfolio.githubStats.followers}</div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{portfolio.githubStats.following}</div>
                    <div className="text-xs text-gray-600">Following</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Language Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(portfolio.githubStats.languages).map(([lang, percentage]) => (
                      <div key={lang} className="flex items-center justify-between text-sm">
                        <span>{lang}</span>
                        <span className="text-gray-500">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {portfolio.aiInsights.collaborationPattern}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
