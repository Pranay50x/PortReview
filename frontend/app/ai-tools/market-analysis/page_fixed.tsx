'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Users,
  RefreshCw,
  Target,
  CheckCircle,
  AlertCircle,
  Download,
  Zap,
  Award,
  Activity
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { recruitmentAIService, type TalentPoolInsights } from '@/lib/recruitment-ai-service';
import { createMarketAnalysisPDF } from '@/lib/pdf-utils';

interface MarketAnalysisFormData {
  role: string;
  location: string;
  experience: string;
  skills: string;
}

function MarketAnalysisContent() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState<MarketAnalysisFormData>({
    role: '',
    location: '',
    experience: '',
    skills: ''
  });
  const [insights, setInsights] = useState<TalentPoolInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'checking' | 'available' | 'fallback'>('checking');

  // Check AI service availability
  useEffect(() => {
    const checkAIService = async () => {
      try {
        setAiStatus('checking');
        await recruitmentAIService.checkAIHealth();
        setAiStatus('available');
      } catch {
        setAiStatus('fallback');
      }
    };
    
    checkAIService();
  }, []);

  const handleAnalyze = async () => {
    if (!formData.role || !formData.location) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Parse skills from comma-separated string
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];

      const requirements = {
        role: formData.role,
        skills: skillsArray,
        experience: formData.experience,
        location: formData.location
      };

      const marketInsights = await recruitmentAIService.getTalentPoolInsights(requirements);
      setInsights(marketInsights);
      setAiStatus('available');
    } catch (err) {
      console.error('Market analysis failed:', err);
      setError('Failed to generate market analysis. Please try again.');
      setAiStatus('fallback');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnalysis = () => {
    if (!insights || !formData.role) return;
    
    createMarketAnalysisPDF(formData.role, insights);
  };

  const getDemandColor = (ratio: number) => {
    if (ratio >= 3) return 'text-red-400';
    if (ratio >= 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getCompetitionColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'very high':
      case 'high':
        return 'bg-red-600/20 text-red-300 border-red-500/40';
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-green-600/20 text-green-300 border-green-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-purple-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AI Tools
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-bold text-white">AI Market Analysis</h1>
            </div>
            <p className="text-slate-300">Get real-time salary insights and competitive benchmarking</p>
          </div>
        </div>

        {/* AI Status */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex items-center gap-2 text-sm">
            {aiStatus === 'checking' && (
              <>
                <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                <span className="text-yellow-400">Checking AI service...</span>
              </>
            )}
            {aiStatus === 'available' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">AI Market Analysis Available</span>
              </>
            )}
            {aiStatus === 'fallback' && (
              <>
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400">Using Enhanced Fallback Analysis</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Input Form - Full Width */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Market Analysis Parameters
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Provide role details to get comprehensive, role-specific market insights
                </CardDescription>
              </div>
              {insights && (
                <Button
                  onClick={downloadAnalysis}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">Analysis Error</span>
                </div>
                <p className="text-xs text-red-200 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAnalyze()}
                  className="mt-2 border-red-600 text-red-300 hover:bg-red-900/30"
                >
                  Retry Analysis
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="role" className="text-white text-sm font-medium">Job Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Data Scientist, UX Designer..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-white text-sm font-medium">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, Remote..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="experience" className="text-white text-sm font-medium">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 3-5 years, Senior..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="skills" className="text-white text-sm font-medium">Key Skills</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, Python, AWS..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !formData.role || !formData.location}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Market Trends...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Market Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Market Analysis Results */}
        {insights ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* Market Demand Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Market Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${getDemandColor(insights.market_demand.demand_supply_ratio)}`}>
                      {insights.market_demand.demand_supply_ratio}x
                    </div>
                    <div className="text-xs text-slate-400">Demand/Supply Ratio</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <Badge className={`mb-1 ${getCompetitionColor(insights.market_demand.competition_level)}`}>
                        {insights.market_demand.competition_level}
                      </Badge>
                      <div className="text-xs text-slate-400">Competition</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-white mb-1">
                        {insights.market_demand.hiring_difficulty}
                      </div>
                      <div className="text-xs text-slate-400">Hiring Difficulty</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Technologies Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Hot Skills & Tech
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">In-Demand Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {insights.hot_skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} className="bg-yellow-600/20 text-yellow-300 border-yellow-500/40 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Emerging Tech</h4>
                  <div className="flex flex-wrap gap-1">
                    {insights.emerging_technologies.slice(0, 3).map((tech, index) => (
                      <Badge key={index} className="bg-green-600/20 text-green-300 border-green-500/40 text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary Trends Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Salary Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(insights.salary_trends).slice(0, 4).map(([skill, growth]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{skill}</span>
                    <span className="text-emerald-400 font-semibold text-sm">+{growth}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : isAnalyzing ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-white text-lg text-center">
                  AI is analyzing market trends...
                </p>
                <p className="text-slate-400 text-sm text-center">
                  Gathering role-specific insights for {formData.role}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Recommendations - Full Width */}
        {insights && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                AI Recommendations for {formData.role}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MarketAnalysis() {
  return (
    <AuthGuard requiredUserType="recruiter">
      <MarketAnalysisContent />
    </AuthGuard>
  );
}
