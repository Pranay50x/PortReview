'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { 
  Github, 
  Zap, 
  Target, 
  MessageCircle, 
  TrendingUp, 
  Share2,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  User,
  LogIn
} from 'lucide-react';

interface AutoPortfolioProps {
  onPortfolioCreated?: (portfolioData: any) => void;
}

export default function AutoPortfolioGenerator({ onPortfolioCreated }: AutoPortfolioProps) {
  const [user, setUser] = useState(getCurrentUser());
  const [githubUsername, setGithubUsername] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPortfolio, setGeneratedPortfolio] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState('');
  const [useLoggedInUser, setUseLoggedInUser] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Auto-fill with logged-in user's GitHub username
    if (currentUser?.github_username) {
      setGithubUsername(currentUser.github_username);
    }
  }, []);

  const getEffectiveUsername = () => {
    return (useLoggedInUser && user?.github_username) ? user.github_username : githubUsername;
  };

  const handlePreview = async () => {
    const effectiveUsername = getEffectiveUsername();
    
    if (!effectiveUsername.trim()) {
      setError('Please enter a GitHub username or log in with GitHub');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch(`http://localhost:8000/api/auto-portfolio/demo/${effectiveUsername}`);
      const data = await response.json();

      if (response.ok) {
        setPreviewData(data);
      } else {
        setError(data.detail || 'Failed to generate preview');
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePortfolio = async () => {
    const effectiveUsername = getEffectiveUsername();
    
    if (!effectiveUsername.trim()) {
      setError('Please enter a GitHub username or log in with GitHub');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:8000/api/auto-portfolio/create-from-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ github_username: effectiveUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedPortfolio(data);
        onPortfolioCreated?.(data);
      } else {
        setError(data.detail || 'Failed to create portfolio');
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const uspFeatures = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "One-Click Generation",
      description: "Instant portfolio from GitHub data alone"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "AI Quality Scoring",
      description: "Code craftsmanship score (0-100)"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Smart Interview Questions",
      description: "Contextual questions based on your code"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Skill Progression",
      description: "Track learning journey over time"
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Zero-Setup Sharing",
      description: "Ready-to-share portfolio links"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Auto-Portfolio Generator
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Transform your GitHub into a compelling portfolio with AI-powered insights. 
            No manual work required – {user?.github_username ? 'your GitHub is already connected!' : 'just enter your username and watch the magic happen.'}
          </p>
          
          {/* User Status */}
          {user?.github_username ? (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-800/30 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">GitHub Connected</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <Github className="w-4 h-4" />
                <span>@{user.github_username}</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-800/30 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                <LogIn className="w-5 h-5" />
                <span className="font-semibold">Not Connected</span>
              </div>
              <p className="text-slate-300 text-sm">
                <a href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
                  Log in with GitHub
                </a> for instant portfolio generation
              </p>
            </div>
          )}
        </div>

        {/* USP Features */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {uspFeatures.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-blue-400 flex justify-center mb-2">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Input Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Github className="w-5 h-5" />
              GitHub Username
              {user?.github_username && (
                <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-700/50">
                  Auto-detected
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {user?.github_username 
                ? 'We\'ve automatically detected your GitHub username, but you can change it below if needed'
                : 'Enter your GitHub username to generate a professional portfolio automatically'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Username Source Toggle */}
            {user?.github_username && (
              <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={useLoggedInUser}
                      onChange={(e) => setUseLoggedInUser(e.target.checked)}
                      className="rounded"
                    />
                    Use my connected GitHub account (@{user.github_username})
                  </label>
                  <div className="flex items-center gap-1 text-green-400">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Logged in</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="e.g., octocat"
                value={useLoggedInUser && user?.github_username ? user.github_username : githubUsername}
                onChange={(e) => {
                  setGithubUsername(e.target.value);
                  if (user?.github_username) {
                    setUseLoggedInUser(false);
                  }
                }}
                disabled={useLoggedInUser && !!user?.github_username}
                className="bg-slate-900 border-slate-600 text-white placeholder-slate-400 flex-1 disabled:opacity-50"
                onKeyPress={(e) => e.key === 'Enter' && handlePreview()}
              />
              <Button 
                onClick={handlePreview}
                disabled={isGenerating}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Preview
                  </div>
                ) : (
                  'Preview'
                )}
              </Button>
              <Button 
                onClick={handleCreatePortfolio}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Portfolio
                  </div>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-red-400 mt-2 text-sm">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Preview Data */}
        {previewData && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Portfolio Preview</CardTitle>
              <CardDescription className="text-slate-400">
                Here's what your auto-generated portfolio would look like
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Generated Content</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Portfolio Title</label>
                      <p className="text-white">{previewData.preview_data?.suggested_title}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">AI-Generated Bio</label>
                      <p className="text-slate-300 text-sm">{previewData.preview_data?.ai_generated_bio}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Primary Languages</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {previewData.preview_data?.primary_languages?.map((lang: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-slate-700 text-slate-300">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">AI Insights</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Craftsmanship Score</span>
                      <span className="text-blue-400 font-semibold">
                        {previewData.preview_data?.craftsmanship_score}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Repositories</span>
                      <span className="text-white">{previewData.preview_data?.total_repositories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">High-Impact Projects</span>
                      <span className="text-green-400">{previewData.preview_data?.high_impact_projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Interview Questions</span>
                      <span className="text-purple-400">{previewData.preview_data?.interview_questions_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-800/30">
                <h4 className="text-white font-semibold mb-2">Value Delivered</h4>
                <div className="space-y-1">
                  {previewData.value_proposition?.map((value: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Portfolio Success */}
        {generatedPortfolio && (
          <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-800/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Portfolio Created Successfully!
              </CardTitle>
              <CardDescription className="text-slate-300">
                Your portfolio has been auto-generated with AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Features Generated</h3>
                  <div className="space-y-2">
                    {generatedPortfolio.features_generated?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">Next Steps</h3>
                  <div className="space-y-2">
                    {generatedPortfolio.next_steps?.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={() => window.open(`/portfolio/${getEffectiveUsername()}`, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Portfolio
                </Button>
                <Button 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setGeneratedPortfolio(null)}
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Savings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Time Saved</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-red-400">20-40 hours</div>
                <div className="text-slate-400">Traditional Portfolio</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">&lt; 5 minutes</div>
                <div className="text-slate-400">PortReview Auto</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">95%+</div>
                <div className="text-slate-400">Time Reduction</div>
              </div>
            </div>
            <p className="text-slate-300 mt-4">
              Stop writing portfolios. Start building code. We'll handle the rest.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
