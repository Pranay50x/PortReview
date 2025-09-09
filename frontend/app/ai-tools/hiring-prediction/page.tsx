'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  TrendingUp,
  Target,
  ArrowLeft,
  Download,
  RefreshCw,
  Users,
  Award,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface Candidate {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  experience: string;
  location: string;
  skills: string[];
  interviewScore: number;
  technicalScore: number;
  culturalFit: number;
  summary: string;
}

// Mock candidates with prediction data
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Frontend Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    experience: '5 years',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    interviewScore: 92,
    technicalScore: 88,
    culturalFit: 94,
    summary: 'Passionate frontend developer with expertise in modern React ecosystem and responsive design.'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Full Stack Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    experience: '7 years',
    location: 'Austin, TX',
    skills: ['Node.js', 'Python', 'React', 'PostgreSQL', 'AWS', 'Docker'],
    interviewScore: 85,
    technicalScore: 95,
    culturalFit: 78,
    summary: 'Experienced full-stack developer with strong backend expertise and cloud architecture knowledge.'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    experience: '4 years',
    location: 'Remote',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
    interviewScore: 89,
    technicalScore: 82,
    culturalFit: 91,
    summary: 'Creative UX designer focused on user-centered design and accessibility best practices.'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'DevOps Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    experience: '6 years',
    location: 'Seattle, WA',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Monitoring', 'Linux'],
    interviewScore: 76,
    technicalScore: 91,
    culturalFit: 72,
    summary: 'DevOps specialist with expertise in container orchestration and infrastructure automation.'
  }
];

export default function HiringPredictionPage() {
  const router = useRouter();
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [prediction, setPrediction] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallMetrics, setOverallMetrics] = useState({
    avgSuccessRate: 0,
    topPerformerCount: 0,
    riskyHires: 0
  });

  // Auto-analyze first candidate and calculate metrics on load
  useEffect(() => {
    if (candidates.length > 0) {
      setSelectedCandidate(candidates[0]);
      calculateOverallMetrics();
    }
  }, [candidates]);

  // Auto-analyze when candidate is selected
  useEffect(() => {
    if (selectedCandidate) {
      handlePredict();
    }
  }, [selectedCandidate]);

  const calculateOverallMetrics = () => {
    const successRates = candidates.map(c => calculateSuccessRate(c));
    const avgSuccessRate = Math.round(successRates.reduce((a, b) => a + b, 0) / successRates.length);
    const topPerformerCount = successRates.filter(rate => rate >= 85).length;
    const riskyHires = successRates.filter(rate => rate < 70).length;
    
    setOverallMetrics({ avgSuccessRate, topPerformerCount, riskyHires });
  };

  const calculateSuccessRate = (candidate: Candidate) => {
    // Weight different factors
    const interviewWeight = 0.3;
    const technicalWeight = 0.4;
    const culturalWeight = 0.3;
    
    return Math.round(
      (candidate.interviewScore * interviewWeight) +
      (candidate.technicalScore * technicalWeight) +
      (candidate.culturalFit * culturalWeight)
    );
  };

  const getSuccessLevel = (rate: number) => {
    if (rate >= 90) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (rate >= 80) return { level: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (rate >= 70) return { level: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'Risk', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const handlePredict = async () => {
    if (!selectedCandidate) return;
    
    setIsAnalyzing(true);
    
    const successRate = calculateSuccessRate(selectedCandidate);
    const successInfo = getSuccessLevel(successRate);
    
    // Create detailed prediction report
    const predictionContent = `# Hiring Prediction Report: ${selectedCandidate.name}

## Overall Success Probability: ${successRate}%
**Prediction Level**: ${successInfo.level}

## Detailed Analysis

### Performance Indicators
- **Interview Performance**: ${selectedCandidate.interviewScore}% - ${selectedCandidate.interviewScore >= 85 ? 'Strong communicator' : selectedCandidate.interviewScore >= 70 ? 'Adequate communication' : 'Needs improvement'}
- **Technical Competency**: ${selectedCandidate.technicalScore}% - ${selectedCandidate.technicalScore >= 85 ? 'Expert level' : selectedCandidate.technicalScore >= 70 ? 'Proficient' : 'Developing skills'}
- **Cultural Alignment**: ${selectedCandidate.culturalFit}% - ${selectedCandidate.culturalFit >= 85 ? 'Excellent fit' : selectedCandidate.culturalFit >= 70 ? 'Good fit' : 'Potential concerns'}

### Success Factors
${getSuccessFactors(selectedCandidate)}

### Risk Assessment
${getRiskAssessment(selectedCandidate)}

### Onboarding Recommendations
${getOnboardingRecommendations(selectedCandidate)}

### Retention Predictions
- **6-Month Retention**: ${Math.min(successRate + 5, 98)}%
- **1-Year Retention**: ${Math.max(successRate - 10, 70)}%
- **Career Growth Potential**: ${getGrowthPotential(selectedCandidate)}

### Key Metrics Comparison
- **vs. Company Average**: ${successRate >= 82 ? '+' : ''}${successRate - 82}%
- **vs. Role Benchmark**: ${successRate >= 85 ? '+' : ''}${successRate - 85}%
- **Market Competitiveness**: ${getMarketRating(selectedCandidate)}

## Final Recommendation
**${getFinalRecommendation(successRate, selectedCandidate)}**

---
*Prediction generated using AI algorithms analyzing interview performance, technical assessments, and cultural fit indicators.*`;

    // Simulate AI processing
    setTimeout(() => {
      setPrediction(predictionContent);
      setIsAnalyzing(false);
    }, 2500);
  };

  // Helper functions
  const getSuccessFactors = (candidate: Candidate) => {
    const factors = [];
    if (candidate.interviewScore >= 85) factors.push('- Strong communication and presentation skills');
    if (candidate.technicalScore >= 85) factors.push('- High technical competency and problem-solving ability');
    if (candidate.culturalFit >= 85) factors.push('- Excellent cultural alignment and team integration potential');
    if (candidate.experience.includes('5+') || candidate.experience.includes('6') || candidate.experience.includes('7')) {
      factors.push('- Substantial relevant experience in the field');
    }
    if (candidate.skills.length >= 5) factors.push('- Diverse technical skill set and adaptability');
    
    return factors.length > 0 ? factors.join('\n') : '- Adequate baseline qualifications for the role';
  };

  const getRiskAssessment = (candidate: Candidate) => {
    const risks = [];
    if (candidate.interviewScore < 70) risks.push('- Communication challenges may impact team collaboration');
    if (candidate.technicalScore < 70) risks.push('- Technical skills may require additional training and support');
    if (candidate.culturalFit < 70) risks.push('- Cultural misalignment could affect team dynamics and retention');
    
    return risks.length > 0 ? risks.join('\n') : '- Low risk profile with minimal concerns identified';
  };

  const getOnboardingRecommendations = (candidate: Candidate) => {
    const recommendations = [];
    if (candidate.interviewScore < 80) recommendations.push('- Provide communication and presentation training');
    if (candidate.technicalScore < 80) recommendations.push('- Implement structured technical mentoring program');
    if (candidate.culturalFit < 80) recommendations.push('- Assign cultural ambassador and team integration activities');
    recommendations.push('- Regular check-ins during first 90 days');
    recommendations.push('- Set clear expectations and measurable goals');
    
    return recommendations.join('\n');
  };

  const getGrowthPotential = (candidate: Candidate) => {
    const avgScore = (candidate.interviewScore + candidate.technicalScore + candidate.culturalFit) / 3;
    if (avgScore >= 90) return 'High - Leadership potential within 2-3 years';
    if (avgScore >= 80) return 'Medium-High - Senior role potential within 3-5 years';
    if (avgScore >= 70) return 'Medium - Steady progression expected';
    return 'Limited - Focus on skill development required';
  };

  const getMarketRating = (candidate: Candidate) => {
    const skillCount = candidate.skills.length;
    const exp = parseInt(candidate.experience);
    if (skillCount >= 5 && exp >= 5) return 'Highly Competitive';
    if (skillCount >= 4 && exp >= 3) return 'Competitive';
    return 'Average';
  };

  const getFinalRecommendation = (rate: number, candidate: Candidate) => {
    if (rate >= 90) return `**STRONG HIRE** - ${candidate.name} shows exceptional potential for success and long-term value`;
    if (rate >= 80) return `**HIRE** - ${candidate.name} meets expectations with good success probability`;
    if (rate >= 70) return `**CONDITIONAL HIRE** - Consider with additional training and support plans`;
    return `**PASS** - High risk profile requiring significant investment`;
  };

  const downloadPrediction = () => {
    if (!selectedCandidate || !prediction) return;
    
    const element = document.createElement("a");
    const file = new Blob([prediction], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedCandidate.name.replace(/\s+/g, '_')}_Hiring_Prediction.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Navigation */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-400" />
                <h1 className="text-xl font-semibold text-white">AI Hiring Prediction Model</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Metrics */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm">Average Success Rate</p>
                    <p className="text-2xl font-bold text-white">{overallMetrics.avgSuccessRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm">Top Performers</p>
                    <p className="text-2xl font-bold text-white">{overallMetrics.topPerformerCount}/{candidates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm">Risk Alerts</p>
                    <p className="text-2xl font-bold text-white">{overallMetrics.riskyHires}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Candidate List */}
            <div className="order-2 lg:order-1 lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                    Candidates ({candidates.length})
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-sm">
                    Select a candidate for prediction analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {candidates.map((candidate) => {
                    const successRate = calculateSuccessRate(candidate);
                    const successInfo = getSuccessLevel(successRate);
                    
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidate(candidate)}
                        className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          selectedCandidate?.id === candidate.id
                            ? 'bg-pink-600/20 border-pink-500/40 shadow-lg shadow-pink-500/20'
                            : 'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback className="text-xs sm:text-sm">{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate text-sm sm:text-base">{candidate.name}</h3>
                            <p className="text-slate-300 text-xs sm:text-sm truncate">{candidate.role}</p>
                            <div className="flex items-center gap-2 mt-1 sm:mt-2">
                              <Badge className={`text-xs px-1.5 py-0.5 ${successInfo.bg} ${successInfo.color} border-0`}>
                                {successRate}% Success
                              </Badge>
                            </div>
                            <div className="mt-1 sm:mt-2">
                              <Progress value={successRate} className="h-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Prediction Results */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5 text-pink-400" />
                      Hiring Prediction Report
                      {selectedCandidate && (
                        <Badge className="ml-2 bg-pink-600/20 text-pink-300 text-xs">
                          {selectedCandidate.name}
                        </Badge>
                      )}
                    </CardTitle>
                    {prediction && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadPrediction}
                        className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    )}
                  </div>
                  {selectedCandidate && (
                    <CardDescription className="text-slate-300 text-sm">
                      AI-powered success prediction for {selectedCandidate.role} position
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
                      <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 animate-spin" />
                      <p className="text-white text-base sm:text-lg text-center">AI is analyzing hiring probability...</p>
                      <p className="text-slate-400 text-sm text-center">Processing performance indicators and success patterns</p>
                    </div>
                  ) : prediction ? (
                    <div className="bg-slate-900/50 rounded-lg p-3 sm:p-6 border border-slate-700">
                      <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold text-white mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base sm:text-lg font-semibold text-white mb-3 mt-6">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm sm:text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                            p: ({ children }) => <p className="text-slate-300 text-sm sm:text-base mb-3 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="text-slate-300 text-sm sm:text-base mb-3 space-y-1 pl-4">{children}</ul>,
                            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                          }}
                        >
                          {prediction}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
                      <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />
                      <p className="text-slate-400 text-base sm:text-lg text-center">Select a candidate to view prediction analysis</p>
                      <p className="text-slate-500 text-sm text-center px-4">AI will analyze success probability and provide recommendations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
