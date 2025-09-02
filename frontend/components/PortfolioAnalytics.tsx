'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  GitBranch, 
  Star, 
  Code, 
  Code2,
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { aiService, AIInsights, GitHubRepo } from '@/lib/ai-service';

interface PortfolioAnalyticsProps {
  githubUsername?: string;
  className?: string;
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ 
  githubUsername, 
  className = '' 
}) => {
  const [analysis, setAnalysis] = useState<AIInsights | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProfile = async () => {
    if (!githubUsername) {
      setError('GitHub username is required for analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeGitHubProfile(githubUsername);
      setAnalysis(result.ai_insights);
      setRepositories(result.repositories);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze GitHub profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (githubUsername) {
      analyzeProfile();
    }
  }, [githubUsername]);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (!githubUsername) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Portfolio Analysis
          </CardTitle>
          <CardDescription className="text-slate-300">
            Connect your GitHub to get AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-8">
            Please add your GitHub username to enable AI analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Analysis Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Portfolio Analysis
              </CardTitle>
              <CardDescription className="text-slate-300">
                AI-powered insights from your GitHub repositories
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={analyzeProfile}
              disabled={loading}
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyzing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="text-slate-300">🤖 AI is analyzing your repositories...</div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-600 rounded w-3/4 mx-auto"></div>
                  <div className="h-2 bg-slate-600 rounded w-1/2 mx-auto"></div>
                  <div className="h-2 bg-slate-600 rounded w-2/3 mx-auto"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
              <Button 
                variant="outline" 
                onClick={analyzeProfile} 
                className="mt-4 border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-6">
              {/* Code Quality Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {analysis.code_quality_score}%
                </div>
                <div className={`text-lg font-medium ${getQualityColor(analysis.code_quality_score)}`}>
                  {getQualityLabel(analysis.code_quality_score)} Code Quality
                </div>
                <Progress 
                  value={analysis.code_quality_score} 
                  className="mt-4 bg-slate-700"
                />
              </div>

              {/* Experience Level */}
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-purple-900/50 text-purple-300 border-purple-700/50">
                  {analysis.experience_level} Developer
                </Badge>
              </div>

              {/* Technical Skills */}
              {analysis.technical_skills && Object.keys(analysis.technical_skills).length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    Technical Skills
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.technical_skills).slice(0, 5).map(([skill, proficiency]: [string, any], index: number) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-slate-300">{skill}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">{Math.round((proficiency as number) * 100)}%</span>
                          <div className="w-16 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(proficiency as number) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {analysis.technical_skills && Object.keys(analysis.technical_skills).length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Technical Skills Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(analysis.technical_skills).slice(0, 6).map(([skill, score]) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">{skill}</span>
                        <span className={`font-medium ${getQualityColor(score * 100)}`}>
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strengths & Recommendations */}
      {analysis && !loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.strengths?.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Repositories */}
      {repositories.length > 0 && !loading && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-400" />
              Top Repositories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {repositories.slice(0, 5).map((repo) => (
                <div key={repo.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <div className="flex-1">
                    <h5 className="text-white font-medium">{repo.name}</h5>
                    {repo.description && (
                      <p className="text-slate-400 text-sm mt-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {repo.language && (
                        <span className="text-blue-400 text-xs">{repo.language}</span>
                      )}
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {repo.forks}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="border-slate-600 text-slate-300 hover:text-white"
                  >
                    <a href={repo.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioAnalytics;
