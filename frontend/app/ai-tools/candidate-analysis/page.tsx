'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  ArrowLeft,
  Download,
  RefreshCw,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { recruitmentAIService, type CandidateProfile, type CandidateAnalysis } from '@/lib/recruitment-ai-service';

interface Candidate extends CandidateProfile {
  github?: string;
  linkedin?: string;
}

// Mock candidate data for analysis
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Frontend Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    experience: '5 years',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Redux'],
    github_username: 'sarahchen-dev',
    linkedin: 'sarah-chen-dev',
    summary: 'Passionate frontend developer with expertise in modern React ecosystem and responsive design. Led frontend teams and contributed to open-source projects.',
    github_data: {
      repositories: 25,
      contributions: 1200,
      followers: 150,
      languages: ['JavaScript', 'TypeScript', 'CSS']
    }
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Full Stack Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    experience: '7 years',
    location: 'Austin, TX',
    skills: ['Node.js', 'Python', 'React', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
    github_username: 'marcus-j-dev',
    linkedin: 'marcus-johnson-dev',
    summary: 'Experienced full-stack developer with strong backend expertise and cloud architecture knowledge. Specialized in microservices and scalable systems.',
    github_data: {
      repositories: 42,
      contributions: 2100,
      followers: 280,
      languages: ['JavaScript', 'Python', 'Go']
    }
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    experience: '4 years',
    location: 'Remote',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'HTML/CSS'],
    github_username: 'emily-ux-design',
    linkedin: 'emily-rodriguez-ux',
    summary: 'Creative UX designer focused on user-centered design and accessibility best practices. Strong advocate for inclusive design.',
    github_data: {
      repositories: 15,
      contributions: 450,
      followers: 95,
      languages: ['CSS', 'HTML', 'JavaScript']
    }
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'DevOps Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    experience: '6 years',
    location: 'Seattle, WA',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Monitoring', 'Linux', 'Python'],
    github_username: 'davidkim-ops',
    linkedin: 'david-kim-devops',
    summary: 'DevOps specialist with expertise in container orchestration and infrastructure automation. Passionate about reliability engineering.',
    github_data: {
      repositories: 35,
      contributions: 1800,
      followers: 220,
      languages: ['Python', 'Shell', 'Go']
    }
  }
];

export default function CandidateAnalysisPage() {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [analysis, setAnalysis] = useState<CandidateAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidates] = useState<CandidateProfile[]>(mockCandidates);
  const [aiStatus, setAiStatus] = useState<'checking' | 'available' | 'fallback'>('checking');
  const [error, setError] = useState<string | null>(null);

  // Check AI service availability
  useEffect(() => {
    const checkAIService = async () => {
      try {
        setAiStatus('checking');
        // Test the AI service availability
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/recruitment/health`);
        setAiStatus('available');
      } catch {
        setAiStatus('fallback');
      }
    };
    
    checkAIService();
  }, []);  const handleAnalyze = useCallback(async () => {
    if (!selectedCandidate) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Check AI service status first
      setAiStatus('checking');
      
      const analysisResult = await recruitmentAIService.analyzeCandidate(selectedCandidate);
      
      // Set AI status based on response
      setAiStatus('available');
      setAnalysis(analysisResult);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze candidate. Please try again.');
      setAiStatus('fallback');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedCandidate]);

  // Auto-analyze first candidate on load
  useEffect(() => {
    if (candidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(candidates[0]);
    }
  }, [candidates, selectedCandidate]);

  // Auto-analyze when candidate is selected
  useEffect(() => {
    if (selectedCandidate) {
      handleAnalyze();
    }
  }, [selectedCandidate, handleAnalyze]);

  const downloadAnalysis = () => {
    if (!selectedCandidate || !analysis) return;
    
    // Convert analysis object to readable text format
    const analysisText = `# Candidate Analysis: ${selectedCandidate.name}

## Professional Profile
- Role: ${selectedCandidate.role}
- Experience: ${selectedCandidate.experience}
- Location: ${selectedCandidate.location}
- Summary: ${selectedCandidate.summary}

## AI Analysis Results
- Technical Score: ${analysis.technical_score}/100
- Cultural Fit: ${analysis.cultural_fit}/100
- Experience Level: ${analysis.experience_level}
- Hiring Recommendation: ${analysis.hiring_recommendation}
- Salary Range: ${analysis.salary_range}

## Strengths
${analysis.strengths.map(strength => `- ${strength}`).join('\n')}

## Areas for Development
${analysis.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

## Skills Assessment
${Object.entries(analysis.skills_assessment).map(([skill, level]) => `- ${skill}: ${level}`).join('\n')}

## Interview Questions
${analysis.interview_questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

---
Analysis generated on ${new Date().toLocaleDateString()}`;
    
    const element = document.createElement("a");
    const file = new Blob([analysisText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedCandidate.name.replace(/\s+/g, '_')}_Analysis.txt`;
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
                <Brain className="w-5 h-5 text-purple-400" />
                <h1 className="text-xl font-semibold text-white">AI Candidate Analysis</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
                    Select a candidate for AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        selectedCandidate?.id === candidate.id
                          ? 'bg-purple-600/20 border-purple-500/40 shadow-lg shadow-purple-500/20'
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
                          <p className="text-slate-400 text-xs hidden sm:block">{candidate.experience} • {candidate.location}</p>
                          <p className="text-slate-400 text-xs sm:hidden">{candidate.experience}</p>
                          <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                            {candidate.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs bg-blue-600/20 text-blue-300 px-1.5 py-0.5">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 2 && (
                              <Badge variant="secondary" className="text-xs bg-slate-600/20 text-slate-400 px-1.5 py-0.5">
                                +{candidate.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5 text-purple-400" />
                      AI Analysis Results
                      {selectedCandidate && (
                        <Badge className="ml-2 bg-purple-600/20 text-purple-300 text-xs">
                          {selectedCandidate.name}
                        </Badge>
                      )}
                    </CardTitle>
                    {analysis && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAnalysis}
                        className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                  {selectedCandidate && (
                    <CardDescription className="text-slate-300 text-sm">
                      Comprehensive AI analysis for {selectedCandidate.role} position
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {/* AI Status Indicator */}
                  <div className="mb-4 flex items-center gap-2">
                    {aiStatus === 'checking' && (
                      <>
                        <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                        <span className="text-xs text-yellow-400">Checking AI service...</span>
                      </>
                    )}
                    {aiStatus === 'available' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">AI Analysis Available</span>
                      </>
                    )}
                    {aiStatus === 'fallback' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">Using Enhanced Fallback Analysis</span>
                      </>
                    )}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
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

                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
                      <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-spin" />
                      <p className="text-white text-base sm:text-lg text-center">
                        AI is analyzing candidate profile...
                      </p>
                      <p className="text-slate-400 text-sm text-center">
                        {aiStatus === 'available' 
                          ? 'Using advanced AI models for comprehensive analysis'
                          : 'Generating enhanced analysis based on candidate data'
                        }
                      </p>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Score Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                          <div className="text-center">
                            <div className="text-lg sm:text-xl font-bold text-white">
                              {analysis.technical_score}
                            </div>
                            <div className="text-xs text-slate-400">Technical Score</div>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                          <div className="text-center">
                            <div className="text-lg sm:text-xl font-bold text-white">
                              {analysis.cultural_fit}
                            </div>
                            <div className="text-xs text-slate-400">Cultural Fit</div>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-white">
                              {analysis.experience_level}
                            </div>
                            <div className="text-xs text-slate-400">Experience Level</div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation Badge */}
                      <div className="flex justify-center">
                        <Badge 
                          className={`px-4 py-2 text-sm font-medium ${
                            analysis.hiring_recommendation === 'strongly_recommended' 
                              ? 'bg-green-600/20 text-green-300 border-green-500/40'
                              : analysis.hiring_recommendation === 'recommended'
                              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                              : analysis.hiring_recommendation === 'consider'
                              ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/40'
                              : 'bg-red-600/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          {analysis.hiring_recommendation.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      {/* Salary Range */}
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{analysis.salary_range}</div>
                        <div className="text-sm text-slate-400">Recommended Salary Range</div>
                      </div>

                      {/* Detailed Analysis */}
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 space-y-4">
                        {/* Strengths */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Key Strengths</h4>
                          <div className="space-y-1">
                            {analysis.strengths.map((strength, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-300">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Areas for Development */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Areas for Development</h4>
                          <div className="space-y-1">
                            {analysis.weaknesses.map((weakness, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-300">{weakness}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Skills Assessment */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Skills Assessment</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(analysis.skills_assessment).map(([skill, level]) => (
                              <div key={skill} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                                <span className="text-sm text-slate-300">{skill}</span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    level === 'Expert' ? 'bg-green-600/20 text-green-300'
                                    : level === 'Advanced' ? 'bg-blue-600/20 text-blue-300'
                                    : level === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-300'
                                    : 'bg-gray-600/20 text-gray-300'
                                  }`}
                                >
                                  {level}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interview Questions */}
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Recommended Interview Questions</h4>
                          <div className="space-y-2">
                            {analysis.interview_questions.map((question, index) => (
                              <div key={index} className="bg-slate-800/50 rounded p-2">
                                <span className="text-sm text-slate-300">
                                  {index + 1}. {question}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
                      <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />
                      <p className="text-slate-400 text-base sm:text-lg text-center">
                        Select a candidate to view AI analysis
                      </p>
                      <p className="text-slate-500 text-sm text-center px-4">
                        Our AI will provide comprehensive insights and recommendations
                      </p>
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
};
