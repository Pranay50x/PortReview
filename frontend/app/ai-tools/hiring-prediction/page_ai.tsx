'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Clock,
  AlertCircle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { recruitmentAIService, type CandidateProfile, type HiringPrediction } from '@/lib/recruitment-ai-service';

interface CandidateWithPrediction extends CandidateProfile {
  interviewScore?: number;
  technicalScore?: number;
  culturalFit?: number;
  prediction?: HiringPrediction;
}

// Enhanced candidate data for hiring predictions
const candidatesWithProfiles: CandidateWithPrediction[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Frontend Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    experience: '5 years',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Jest', 'Cypress'],
    github_username: 'sarah-chen-dev',
    summary: 'Passionate frontend developer with expertise in modern React ecosystem, responsive design, and performance optimization. Led multiple successful product launches.',
    interviewScore: 92,
    technicalScore: 88,
    culturalFit: 94
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Full Stack Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    experience: '7 years',
    location: 'Austin, TX',
    skills: ['Node.js', 'Python', 'React', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
    github_username: 'marcus-fullstack',
    summary: 'Experienced full-stack developer with strong backend expertise and cloud architecture knowledge. Built scalable systems serving millions of users.',
    interviewScore: 85,
    technicalScore: 95,
    culturalFit: 78
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Senior UX Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    experience: '4 years',
    location: 'Remote',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    summary: 'Creative UX designer focused on user-centered design and accessibility best practices. Increased user engagement by 40% through design improvements.',
    interviewScore: 89,
    technicalScore: 82,
    culturalFit: 91
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'DevOps Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    experience: '6 years',
    location: 'Seattle, WA',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Docker', 'Monitoring', 'Security'],
    github_username: 'david-devops',
    summary: 'DevOps engineer specializing in cloud infrastructure and automation. Reduced deployment time by 80% and improved system reliability.',
    interviewScore: 90,
    technicalScore: 93,
    culturalFit: 85
  }
];

export default function HiringPredictionPage() {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithPrediction | null>(null);
  const [prediction, setPrediction] = useState<HiringPrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [candidates, setCandidates] = useState<CandidateWithPrediction[]>(candidatesWithProfiles);
  const [aiStatus, setAiStatus] = useState<'checking' | 'available' | 'fallback'>('checking');
  const [error, setError] = useState<string | null>(null);

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

  // Auto-predict for first candidate on load
  useEffect(() => {
    if (candidates.length > 0 && !selectedCandidate && aiStatus !== 'checking') {
      setSelectedCandidate(candidates[0]);
    }
  }, [candidates, selectedCandidate, aiStatus]);

  // Auto-predict when candidate is selected
  useEffect(() => {
    if (selectedCandidate && aiStatus !== 'checking') {
      handlePredict();
    }
  }, [selectedCandidate, aiStatus]);

  const handlePredict = async () => {
    if (!selectedCandidate) return;
    
    setIsPredicting(true);
    setError(null);
    
    try {
      // Define role requirements based on candidate's role
      const roleRequirements = {
        role: selectedCandidate.role,
        skills: selectedCandidate.skills,
        experience: selectedCandidate.experience,
        responsibilities: getRoleResponsibilities(selectedCandidate.role)
      };

      const hiringPrediction = await recruitmentAIService.predictHiringSuccess(selectedCandidate, roleRequirements);
      setPrediction(hiringPrediction);
      
      // Update candidate with prediction
      const updatedCandidates = candidates.map(c => 
        c.id === selectedCandidate.id 
          ? { ...c, prediction: hiringPrediction }
          : c
      );
      setCandidates(updatedCandidates);
      setAiStatus('available');
    } catch (err) {
      console.error('Prediction failed:', err);
      setError('Failed to generate hiring prediction. Please try again.');
      setAiStatus('fallback');
    } finally {
      setIsPredicting(false);
    }
  };

  const getRoleResponsibilities = (role: string): string[] => {
    const responsibilitiesMap: Record<string, string[]> = {
      'Senior Frontend Developer': [
        'Build scalable frontend applications',
        'Lead frontend architecture decisions',
        'Mentor junior developers',
        'Collaborate with design and backend teams'
      ],
      'Full Stack Engineer': [
        'Develop full-stack applications',
        'Design and implement APIs',
        'Optimize database performance',
        'Deploy and maintain cloud infrastructure'
      ],
      'Senior UX Designer': [
        'Conduct user research and usability testing',
        'Create wireframes and prototypes',
        'Maintain design systems',
        'Collaborate with product and engineering teams'
      ],
      'DevOps Engineer': [
        'Manage cloud infrastructure',
        'Implement CI/CD pipelines',
        'Monitor system performance',
        'Ensure security and compliance'
      ]
    };
    
    return responsibilitiesMap[role] || ['Perform role-specific duties', 'Collaborate with team members'];
  };

  const downloadPrediction = () => {
    if (!selectedCandidate || !prediction) return;
    
    const predictionText = `
HIRING PREDICTION REPORT
========================

Candidate: ${selectedCandidate.name}
Role: ${selectedCandidate.role}
Experience: ${selectedCandidate.experience}
Location: ${selectedCandidate.location}
Analysis Date: ${new Date().toLocaleDateString()}

PREDICTION SUMMARY
==================
Success Probability: ${prediction.success_probability * 100}%
Confidence Level: ${prediction.confidence_level}
Performance Prediction: ${prediction.performance_prediction}
Retention Likelihood: ${prediction.retention_likelihood}
Growth Potential: ${prediction.growth_potential}

KEY SUCCESS FACTORS
==================
${prediction.key_success_factors.map((factor, index) => `${index + 1}. ${factor}`).join('\n')}

POTENTIAL RISKS
===============
${prediction.potential_risks.map((risk, index) => `${index + 1}. ${risk}`).join('\n')}

ONBOARDING RECOMMENDATIONS
=========================
${prediction.onboarding_recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

---
Generated by PortReview AI Recruitment System
    `.trim();
    
    const element = document.createElement("a");
    const file = new Blob([predictionText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedCandidate.name.replace(/\s+/g, '_')}_Hiring_Prediction.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getPredictionColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-400';
    if (probability >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceColor = (level: string) => {
    if (level === 'High') return 'bg-green-600/20 text-green-300 border-green-500/40';
    if (level === 'Medium') return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/40';
    return 'bg-red-600/20 text-red-300 border-red-500/40';
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
                <h1 className="text-xl font-semibold text-white">AI Hiring Prediction</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidate Selection */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Candidates
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Select a candidate to predict hiring success
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <span className="text-xs text-green-400">AI Prediction Available</span>
                      </>
                    )}
                    {aiStatus === 'fallback' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">Using Enhanced Fallback</span>
                      </>
                    )}
                  </div>

                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedCandidate?.id === candidate.id
                          ? 'bg-purple-600/20 border-purple-500/50 ring-1 ring-purple-500/30'
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/80 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className="bg-slate-600 text-white">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{candidate.name}</h3>
                          <p className="text-slate-400 text-sm mb-2">{candidate.role}</p>
                          <p className="text-xs text-slate-500 mb-2">{candidate.experience} • {candidate.location}</p>
                          
                          {/* Prediction Preview */}
                          {candidate.prediction && (
                            <div className="mt-2">
                              <Badge 
                                className={`text-xs ${getConfidenceColor(candidate.prediction.confidence_level)}`}
                              >
                                {Math.round(candidate.prediction.success_probability * 100)}% Success
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Prediction Results */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {selectedCandidate ? `${selectedCandidate.name} - Hiring Prediction` : 'Hiring Prediction'}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        AI-powered success probability and recommendations
                      </CardDescription>
                    </div>
                    {prediction && (
                      <Button
                        onClick={downloadPrediction}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-300">Prediction Error</span>
                      </div>
                      <p className="text-xs text-red-200 mt-1">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePredict()}
                        className="mt-2 border-red-600 text-red-300 hover:bg-red-900/30"
                      >
                        Retry Prediction
                      </Button>
                    </div>
                  )}

                  {isPredicting ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                      <p className="text-white text-lg text-center">
                        AI is analyzing hiring success probability...
                      </p>
                      <p className="text-slate-400 text-sm text-center">
                        Evaluating skills, experience, cultural fit, and role alignment
                      </p>
                    </div>
                  ) : prediction && selectedCandidate ? (
                    <div className="space-y-6">
                      {/* Success Probability */}
                      <div className="text-center">
                        <div className={`text-4xl font-bold mb-2 ${getPredictionColor(prediction.success_probability)}`}>
                          {Math.round(prediction.success_probability * 100)}%
                        </div>
                        <p className="text-slate-400 mb-4">Success Probability</p>
                        <Badge 
                          className={`px-4 py-2 ${getConfidenceColor(prediction.confidence_level)}`}
                        >
                          {prediction.confidence_level} Confidence
                        </Badge>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 text-center">
                          <div className="text-lg font-bold text-white mb-1">
                            {prediction.performance_prediction}
                          </div>
                          <div className="text-xs text-slate-400">Performance</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 text-center">
                          <div className="text-lg font-bold text-white mb-1">
                            {prediction.retention_likelihood}
                          </div>
                          <div className="text-xs text-slate-400">Retention</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 text-center">
                          <div className="text-lg font-bold text-white mb-1">
                            {prediction.growth_potential}
                          </div>
                          <div className="text-xs text-slate-400">Growth Potential</div>
                        </div>
                      </div>

                      {/* Success Factors */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">Key Success Factors</h3>
                        </div>
                        <div className="space-y-2">
                          {prediction.key_success_factors.map((factor, index) => (
                            <div key={index} className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-300 text-sm">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Potential Risks */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          <h3 className="text-lg font-semibold text-white">Potential Risks</h3>
                        </div>
                        <div className="space-y-2">
                          {prediction.potential_risks.map((risk, index) => (
                            <div key={index} className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-300 text-sm">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Onboarding Recommendations */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">Onboarding Recommendations</h3>
                        </div>
                        <div className="space-y-2">
                          {prediction.onboarding_recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                              <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-300 text-sm">{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Brain className="w-12 h-12 text-slate-400" />
                      <p className="text-slate-400 text-lg text-center">
                        Select a candidate to generate hiring prediction
                      </p>
                      <p className="text-slate-500 text-sm text-center px-4">
                        Our AI will analyze success probability, performance potential, and provide onboarding recommendations
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
}
