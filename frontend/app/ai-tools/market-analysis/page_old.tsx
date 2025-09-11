'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Users,
  Sparkles,
  RefreshCw,
  Target
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarketData {
  role: string;
  location: string;
  experience: string;
  analysis: string;
}

function MarketAnalysisContent() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    location: '',
    experience: '',
    skills: ''
  });
  const [marketAnalysis, setMarketAnalysis] = useState<string>('');

  const handleAnalyze = async () => {
    if (!formData.role || !formData.location) return;

    setIsAnalyzing(true);
    try {
      // Mock market analysis for demonstration
      const mockAnalysis = `# Market Analysis for ${formData.role}

## **Salary Range Analysis**
- **Entry Level (0-2 years)**: $75,000 - $95,000
- **Mid Level (3-5 years)**: $95,000 - $125,000  
- **Senior Level (5+ years)**: $125,000 - $160,000
- **Lead/Principal**: $160,000 - $200,000+

## **Location Impact: ${formData.location}**
- **Cost of Living Adjustment**: +15% above national average
- **Market Competition**: High demand, competitive salaries
- **Remote Work Premium**: 10-15% salary increase for hybrid/remote roles

## **Key Market Trends**
- **High Demand Skills**: ${formData.skills || 'React, TypeScript, Node.js, AWS'}
- **Growth Rate**: 12% year-over-year salary increase
- **Hiring Timeline**: Average 2-3 weeks for quality candidates
- **Market Temperature**: **Hot** - Candidate-driven market

## **Competitive Benchmarking**
- **Top 25%**: $140,000+ (Premium companies: FAANG, unicorns)
- **Median**: $110,000 (Standard tech companies)
- **Bottom 25%**: $85,000 (Startups, non-tech companies)

## **Recommendations**
1. **Offer competitive base salary** in the $120,000-$140,000 range
2. **Include equity/bonus structure** to compete with top-tier companies  
3. **Highlight remote/flexible work** options
4. **Emphasize growth opportunities** and learning budget
5. **Fast-track hiring process** - top candidates get multiple offers quickly

## **Market Insights**
- **Skill Shortage**: High demand for ${formData.role} roles
- **Candidate Expectations**: Work-life balance, growth opportunities, competitive compensation
- **Retention Strategies**: Career development paths, mentorship programs, competitive benefits`;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMarketAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing market:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
              AI Market Analysis
            </h1>
            <p className="text-slate-300 mt-2">Get real-time salary insights and competitive benchmarking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Market Analysis Parameters
              </CardTitle>
              <CardDescription className="text-slate-300">
                Provide role details to get comprehensive market insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role" className="text-white text-sm font-medium">Job Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Software Engineer, Product Manager..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-white text-sm font-medium">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, New York, Remote..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white text-sm font-medium">Experience Level</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 3-5 years, Senior, Entry-level..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="skills" className="text-white text-sm font-medium">Key Skills (Optional)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. React, Python, AWS, Machine Learning..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-2"
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!formData.role || !formData.location || isAnalyzing}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Market Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Market
                  </>
                )}
              </Button>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-300">Salary Data</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-xs text-slate-300">Market Trends</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-xs text-slate-300">Competition</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Market Analysis Results
              </CardTitle>
              <CardDescription className="text-slate-300">
                Comprehensive insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marketAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 max-h-[600px] overflow-y-auto">
                    <div className="text-white text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {marketAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <div className="text-lg mb-2">Market Analysis Ready</div>
                  <div className="text-sm">Enter job details to generate comprehensive market insights</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
