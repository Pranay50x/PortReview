'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Briefcase, 
  Star, 
  GitFork, 
  Bot, 
  Zap, 
  TrendingUp, 
  Target, 
  Rocket, 
  Book, 
  CheckCircle, 
  Globe,
  Code,
  Users,
  BarChart3,
  Github,
  Calendar,
  ExternalLink,
  Mail,
  Sparkles
} from 'lucide-react';
import { aiService, GitHubRepo, AIInsights } from '@/lib/ai-service';

interface PortfolioData {
  user: {
    name: string;
    email?: string;
    github_username: string;
    avatar_url: string;
    location?: string;
    bio?: string;
    company?: string;
    blog?: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  };
  repositories: GitHubRepo[];
  ai_insights: AIInsights | null;
  portfolio_stats: {
    total_stars: number;
    total_forks: number;
    languages: Record<string, number>;
    most_used_language: string;
  };
}

export default function PortfolioView() {
  const params = useParams();
  const username = params.id as string;
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolioData();
  }, [username]);

  const loadPortfolioData = async () => {
    if (!username) return;
    
    setLoading(true);
    setError(null);

    try {
      // Get AI analysis which includes repositories and insights
      const analysis = await aiService.analyzeGitHubProfile(username);
      
      // Fetch GitHub user data (this would typically come from your backend)
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) {
        throw new Error('GitHub user not found');
      }
      const userData = await userResponse.json();

      // Calculate portfolio stats
      const totalStars = analysis.repositories.reduce((sum, repo) => sum + repo.stars, 0);
      const totalForks = analysis.repositories.reduce((sum, repo) => sum + repo.forks, 0);
      
      // Calculate language distribution
      const languageCount: Record<string, number> = {};
      analysis.repositories.forEach(repo => {
        if (repo.language) {
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
      });
      
      const mostUsedLanguage = Object.entries(languageCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

      // Convert counts to percentages
      const totalRepos = analysis.repositories.filter(repo => repo.language).length;
      const languagePercentages: Record<string, number> = {};
      Object.entries(languageCount).forEach(([lang, count]) => {
        languagePercentages[lang] = Math.round((count / totalRepos) * 100);
      });

      const portfolioData: PortfolioData = {
        user: {
          name: userData.name || userData.login,
          email: userData.email,
          github_username: userData.login,
          avatar_url: userData.avatar_url,
          location: userData.location,
          bio: userData.bio,
          company: userData.company,
          blog: userData.blog,
          public_repos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          created_at: userData.created_at
        },
        repositories: analysis.repositories,
        ai_insights: analysis.ai_insights,
        portfolio_stats: {
          total_stars: totalStars,
          total_forks: totalForks,
          languages: languagePercentages,
          most_used_language: mostUsedLanguage
        }
      };

      setPortfolio(portfolioData);
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
      setError(err.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full mx-auto mb-4 animate-bounce"></div>
          <div className="text-2xl text-slate-300">Loading portfolio...</div>
          <div className="text-sm text-slate-500 mt-2">Fetching GitHub data and AI analysis...</div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-2xl text-slate-300 mb-4">
            {error || 'Portfolio not found'}
          </div>
          <p className="text-slate-400 mb-6">
            {error === 'GitHub user not found' 
              ? `The GitHub user "${username}" doesn't exist or their profile is private.`
              : 'This portfolio may not exist or there was an error loading the data.'
            }
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { user, repositories, ai_insights, portfolio_stats } = portfolio;

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
      <header className="sticky top-0 z-10 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              PortReviewer
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-slate-300 hover:text-cyan-400 transition-all hover:scale-105" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-500 text-white transition-all hover:scale-105" asChild>
                <Link href="/auth/login">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 hover:scale-110">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="text-4xl bg-slate-800 text-cyan-400">
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              {user.name}
            </span>
          </h1>
          {user.bio && (
            <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">{user.bio}</p>
          )}
          
          <div className="flex items-center justify-center gap-8 text-sm text-slate-400 mb-8 flex-wrap">
            {user.location && (
              <span className="flex items-center gap-2 hover:text-slate-300 transition-colors">
                <MapPin className="w-4 h-4" />
                {user.location}
              </span>
            )}
            {user.company && (
              <span className="flex items-center gap-2 hover:text-slate-300 transition-colors">
                <Briefcase className="w-4 h-4" />
                {user.company}
              </span>
            )}
            <span className="flex items-center gap-2 hover:text-slate-300 transition-colors">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            {ai_insights && (
              <span className="flex items-center gap-2 hover:text-green-400 transition-colors">
                <Sparkles className="w-4 h-4" />
                {ai_insights.code_quality_score}% Code Quality
              </span>
            )}
          </div>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white transition-all hover:scale-105" asChild>
              <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                View GitHub Profile
              </a>
            </Button>
            {user.blog && (
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all hover:scale-105" asChild>
                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {user.email && (
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all hover:scale-105" asChild>
                <a href={`mailto:${user.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Projects Section */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  Featured Repositories
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {repositories.length} repositories showcasing technical expertise • {portfolio_stats.total_stars} total stars
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {repositories.length > 0 ? repositories.slice(0, 6).map((repo, index) => (
                  <Card key={repo.name} className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                            {repo.name}
                            {repo.language && (
                              <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                                {repo.language}
                              </Badge>
                            )}
                          </h3>
                          {repo.description && (
                            <p className="text-slate-300 mb-4 line-clamp-2">{repo.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-400 mb-4">
                        <span className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
                          <Star className="w-4 h-4" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                          <GitFork className="w-4 h-4" />
                          {repo.forks}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white transition-all hover:scale-105" asChild>
                          <a href={repo.url} target="_blank" rel="noopener noreferrer">
                            <Code className="w-4 h-4 mr-1" />
                            View Code
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-12">
                    <Github className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Public Repositories</h3>
                    <p className="text-slate-400">This developer hasn't shared any public repositories yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            {ai_insights && (
              <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    AI-Powered Developer Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Comprehensive analysis based on code patterns, commit history, and project complexity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Experience Level & Code Quality */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <Badge 
                        variant="secondary" 
                        className="text-xl px-6 py-3 bg-purple-900/50 text-purple-300 border-purple-700/50 animate-pulse mb-4"
                      >
                        {ai_insights.experience_level} Developer
                      </Badge>
                      <div className="text-3xl font-bold text-white mb-2">
                        {ai_insights.code_quality_score}%
                      </div>
                      <div className="text-sm text-green-400">Code Quality Score</div>
                      <Progress 
                        value={ai_insights.code_quality_score} 
                        className="mt-3 bg-slate-700"
                      />
                    </div>

                    {/* Technical Skills */}
                    {ai_insights.technical_skills && Object.keys(ai_insights.technical_skills).length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-400" />
                          Technical Proficiency
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(ai_insights.technical_skills).slice(0, 4).map(([skill, proficiency]) => (
                            <div key={skill} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm">{skill}</span>
                                <span className="text-cyan-400 font-medium">{Math.round(proficiency * 100)}%</span>
                              </div>
                              <Progress 
                                value={proficiency * 100} 
                                className="bg-slate-700 h-2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Strengths and Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ai_insights.strengths && ai_insights.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Key Strengths
                        </h4>
                        <div className="space-y-2">
                          {ai_insights.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span>{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {ai_insights.recommendations && ai_insights.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Growth Opportunities
                        </h4>
                        <div className="space-y-2">
                          {ai_insights.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                              <BarChart3 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span>{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* GitHub Stats */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Github className="w-5 h-5 text-blue-400" />
                  GitHub Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg hover:bg-blue-900/40 transition-colors">
                    <div className="text-lg font-bold text-blue-400">{user.public_repos}</div>
                    <div className="text-xs text-slate-400">Repositories</div>
                  </div>
                  <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg hover:bg-green-900/40 transition-colors">
                    <div className="text-lg font-bold text-green-400">{portfolio_stats.total_stars}</div>
                    <div className="text-xs text-slate-400">Total Stars</div>
                  </div>
                  <div className="p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg hover:bg-purple-900/40 transition-colors">
                    <div className="text-lg font-bold text-purple-400">{user.followers}</div>
                    <div className="text-xs text-slate-400">Followers</div>
                  </div>
                  <div className="p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg hover:bg-orange-900/40 transition-colors">
                    <div className="text-lg font-bold text-orange-400">{user.following}</div>
                    <div className="text-xs text-slate-400">Following</div>
                  </div>
                </div>

                {/* Language Distribution */}
                {Object.keys(portfolio_stats.languages).length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-white">Language Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(portfolio_stats.languages)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([lang, percentage]) => (
                          <div key={lang} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{lang}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">{percentage}%</span>
                              <div className="w-16 bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      Most used: <span className="text-cyan-400 font-medium">{portfolio_stats.most_used_language}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white transition-all hover:scale-105" asChild>
                  <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    Follow on GitHub
                  </a>
                </Button>
                {user.email && (
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all hover:scale-105" asChild>
                    <a href={`mailto:${user.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                )}
                {user.blog && (
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all hover:scale-105" asChild>
                    <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
