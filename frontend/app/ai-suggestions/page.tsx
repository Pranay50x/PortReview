'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Lightbulb, 
  Target, 
  Code, 
  Users, 
  TrendingUp,
  Brain,
  Rocket,
  Star
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentUser, User } from '@/lib/auth';

interface AISuggestionsData {
  type: string;
  career_paths?: string[];
  growth_areas?: string[];
  summary?: string;
  current_score?: number;
  strengths?: string[];
  improvement_areas?: string[];
  recommendations?: string[];
  next_steps?: string[];
  bio_suggestion?: string;
  skills_summary?: string;
  project_highlights?: Record<string, string>;
  improvement_tips?: string[];
}

function AISuggestionsContent() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<AISuggestionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'career' | 'technical' | 'portfolio'>('career');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAISuggestions();
  }, [activeTab]);

  const loadAISuggestions = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      
      if (!user?.github_username) {
        setError('GitHub username not found. Please reconnect your GitHub account.');
        return;
      }

      // Check cache first
      const cacheKey = `ai_suggestions_${activeTab}_${user.github_username}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) { // 24 hours cache
          setSuggestions(parsed.data);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh suggestions from backend
      const response = await fetch(`http://localhost:8000/api/github/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.github_username,
          suggestion_type: activeTab
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI suggestions');
      }

      const data = await response.json();
      setSuggestions(data);

      // Cache the suggestions
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      setError('Failed to load AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Generating AI suggestions...</p>
          <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={loadAISuggestions} className="bg-cyan-600 hover:bg-cyan-700">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/developer')}
                className="border-slate-600 text-slate-200"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'career' as const, label: 'Career Growth', icon: Target, color: 'cyan' },
    { id: 'technical' as const, label: 'Technical Skills', icon: Code, color: 'teal' },
    { id: 'portfolio' as const, label: 'Portfolio Tips', icon: Star, color: 'purple' }
  ];

  const renderCareerSuggestions = () => {
    if (!suggestions || suggestions.type !== 'career') return null;

    return (
      <div className="space-y-6">
        {suggestions.summary && (
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                AI Career Analysis
              </h3>
              <p className="text-slate-300 leading-relaxed">{suggestions.summary}</p>
            </CardContent>
          </Card>
        )}

        {suggestions.career_paths && suggestions.career_paths.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Recommended Career Paths
              </h3>
              <div className="space-y-3">
                {suggestions.career_paths.map((path, index) => (
                  <div key={index} className="p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
                    <span className="text-green-200 font-medium">{path}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions.growth_areas && suggestions.growth_areas.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Areas for Growth
              </h3>
              <div className="space-y-3">
                {suggestions.growth_areas.map((area, index) => (
                  <div key={index} className="p-4 bg-orange-900/30 border border-orange-700/50 rounded-lg">
                    <span className="text-orange-200">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTechnicalSuggestions = () => {
    if (!suggestions || suggestions.type !== 'technical') return null;

    return (
      <div className="space-y-6">
        {suggestions.current_score && (
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Code className="w-5 h-5 text-teal-400" />
                Technical Assessment Score
              </h3>
              <div className="text-3xl font-bold text-teal-400 mb-2">{suggestions.current_score}%</div>
              <p className="text-slate-300">Overall technical proficiency rating</p>
            </CardContent>
          </Card>
        )}

        {suggestions.strengths && suggestions.strengths.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-green-400" />
                Technical Strengths
              </h3>
              <div className="space-y-3">
                {suggestions.strengths.map((strength, index) => (
                  <div key={index} className="p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
                    <span className="text-green-200">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions.improvement_areas && suggestions.improvement_areas.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {suggestions.improvement_areas.map((area, index) => (
                  <div key={index} className="p-4 bg-orange-900/30 border border-orange-700/50 rounded-lg">
                    <span className="text-orange-200">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions.next_steps && suggestions.next_steps.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                Next Steps
              </h3>
              <div className="space-y-3">
                {suggestions.next_steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-cyan-900/30 border border-cyan-700/50 rounded-lg">
                    <span className="text-cyan-400 font-bold">{index + 1}.</span>
                    <span className="text-cyan-200">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPortfolioSuggestions = () => {
    if (!suggestions || suggestions.type !== 'portfolio') return null;

    return (
      <div className="space-y-6">
        {suggestions.bio_suggestion && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Suggested Bio
              </h3>
              <div className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
                <p className="text-purple-200 leading-relaxed">{suggestions.bio_suggestion}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions.skills_summary && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Skills Summary
              </h3>
              <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                <p className="text-blue-200 leading-relaxed">{suggestions.skills_summary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions.project_highlights && Object.keys(suggestions.project_highlights).length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Project Highlights
              </h3>
              <div className="space-y-4">
                {Object.entries(suggestions.project_highlights).map(([project, description]) => (
                  <div key={project} className="p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                    <h4 className="text-yellow-200 font-semibold mb-2">{project}</h4>
                    <p className="text-yellow-100 text-sm leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions.improvement_tips && suggestions.improvement_tips.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-400" />
                Portfolio Improvement Tips
              </h3>
              <div className="space-y-3">
                {suggestions.improvement_tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
                    <span className="text-green-400 font-bold">{index + 1}.</span>
                    <span className="text-green-200">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/developer')}
                className="text-slate-400 hover:text-white mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI Career Suggestions</h1>
                  <p className="text-slate-400 text-sm">Personalized recommendations to boost your career</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-800/30 p-1 rounded-lg mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-600 text-white shadow-lg`
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Suggestions Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'career' && renderCareerSuggestions()}
            {activeTab === 'technical' && renderTechnicalSuggestions()}
            {activeTab === 'portfolio' && renderPortfolioSuggestions()}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center space-x-4"
          >
            <Button
              onClick={loadAISuggestions}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Refresh Suggestions
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/developer')}
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AISuggestionsPage() {
  return (
    <AuthGuard requiredUserType="developer">
      <AISuggestionsContent />
    </AuthGuard>
  );
}
