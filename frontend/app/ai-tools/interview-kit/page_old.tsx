'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Brain, 
  Code, 
  Users, 
  Download, 
  RefreshCw,
  ArrowLeft,
  Sparkles,
  FileText,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { generateInterviewKit } from '@/lib/ai-agents';
import AuthGuard from '@/components/AuthGuard';

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  experience: string;
  skills: string[];
  location: string;
  status: string;
  matchScore: number;
  githubUrl?: string;
  portfolioUrl?: string;
  resume?: string;
  salary: string;
}

export default function InterviewKitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [candidateData, setCandidateData] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState<'technical' | 'behavioral' | 'coding'>('technical');
  const [kit, setKit] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customRequirements, setCustomRequirements] = useState('');

  useEffect(() => {
    // Get candidate data from URL params or localStorage
    const candidateId = searchParams.get('candidate');
    if (candidateId) {
      // In a real app, fetch candidate data from API
      // For now, use mock data
      const mockCandidate: Candidate = {
        id: candidateId,
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        role: "Senior Frontend Developer",
        experience: "5+ years",
        skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
        location: "San Francisco, CA",
        status: "Under Review",
        matchScore: 92,
        githubUrl: "https://github.com/sarahchen",
        portfolioUrl: "https://sarahchen.dev",
        salary: "$120,000 - $140,000"
      };
      setCandidateData(mockCandidate);
    }
  }, [searchParams]);

  const handleGenerateKit = async () => {
    if (!candidateData) return;
    
    setIsGenerating(true);
    try {
      const result = await generateInterviewKit({
        candidate: candidateData,
        requirements: customRequirements || `Interview kit for ${candidateData.role} position`
      });
      setKit(result);
    } catch (error) {
      console.error('Error generating interview kit:', error);
    }
    setIsGenerating(false);
  };

  const downloadKit = () => {
    if (!kit || !candidateData) return;
    
    const content = `
INTERVIEW KIT FOR ${candidateData.name.toUpperCase()}
Role: ${candidateData.role}
Generated on: ${new Date().toLocaleDateString()}

=== TECHNICAL QUESTIONS ===
${kit.technicalQuestions?.map((q: any, i: number) => `${i + 1}. ${q.question}\n   Expected: ${q.expectedAnswer}\n`).join('\n') || 'No technical questions generated'}

=== BEHAVIORAL QUESTIONS ===
${kit.behavioralQuestions?.map((q: any, i: number) => `${i + 1}. ${q.question}\n   Expected: ${q.expectedAnswer}\n`).join('\n') || 'No behavioral questions generated'}

=== CODING CHALLENGES ===
${kit.codingChallenges?.map((c: any, i: number) => `${i + 1}. ${c.title}\n   Description: ${c.description}\n   Difficulty: ${c.difficulty}\n`).join('\n') || 'No coding challenges generated'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-kit-${candidateData.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard requiredUserType="recruiter">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Animated Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-green-400" />
              AI Interview Kit Generator
            </h1>
            <p className="text-slate-300 mt-2">Generate personalized interview questions and coding challenges</p>
          </div>
        </div>

        {candidateData && (
          <div className="mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Candidate Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{candidateData.name}</h3>
                    <p className="text-slate-300 mb-2">{candidateData.role}</p>
                    <p className="text-slate-400 text-sm mb-4">{candidateData.email}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {candidateData.skills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-600/20 text-green-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{candidateData.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Match Score: {candidateData.matchScore}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{candidateData.salary}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Interview Configuration
              </CardTitle>
              <CardDescription className="text-slate-300">
                Customize the interview kit generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requirements" className="text-white">Additional Requirements</Label>
                <Textarea
                  id="requirements"
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="Any specific requirements for this interview..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleGenerateKit}
                disabled={isGenerating || !candidateData}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Kit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Interview Kit
                  </>
                )}
              </Button>

              {kit && (
                <Button
                  onClick={downloadKit}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Kit
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Generated Kit */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generated Interview Kit
                </CardTitle>
                {kit && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant={activeTab === 'technical' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('technical')}
                      className="text-white"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Technical ({kit.technicalQuestions?.length || 0})
                    </Button>
                    <Button
                      variant={activeTab === 'behavioral' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('behavioral')}
                      className="text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Behavioral ({kit.behavioralQuestions?.length || 0})
                    </Button>
                    <Button
                      variant={activeTab === 'coding' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('coding')}
                      className="text-white"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Coding ({kit.codingChallenges?.length || 0})
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {kit ? (
                  <div className="space-y-4">
                    {activeTab === 'technical' && (
                      <div className="space-y-4">
                        {kit.technicalQuestions?.map((question: any, index: number) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-white font-medium mb-2">Question {index + 1}</h4>
                            <p className="text-slate-300 mb-3">{question.question}</p>
                            <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                              <p className="text-green-300 text-sm"><strong>Expected Answer:</strong></p>
                              <p className="text-green-200 text-sm mt-1">{question.expectedAnswer}</p>
                            </div>
                          </div>
                        )) || <p className="text-slate-400">No technical questions generated</p>}
                      </div>
                    )}

                    {activeTab === 'behavioral' && (
                      <div className="space-y-4">
                        {kit.behavioralQuestions?.map((question: any, index: number) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-white font-medium mb-2">Question {index + 1}</h4>
                            <p className="text-slate-300 mb-3">{question.question}</p>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                              <p className="text-blue-300 text-sm"><strong>What to Look For:</strong></p>
                              <p className="text-blue-200 text-sm mt-1">{question.expectedAnswer}</p>
                            </div>
                          </div>
                        )) || <p className="text-slate-400">No behavioral questions generated</p>}
                      </div>
                    )}

                    {activeTab === 'coding' && (
                      <div className="space-y-4">
                        {kit.codingChallenges?.map((challenge: any, index: number) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium">{challenge.title}</h4>
                              <Badge variant="outline" className="border-yellow-500/20 text-yellow-300">
                                {challenge.difficulty}
                              </Badge>
                            </div>
                            <p className="text-slate-300 mb-3">{challenge.description}</p>
                            {challenge.sampleCode && (
                              <div className="bg-gray-900/50 border border-white/10 rounded p-3">
                                <p className="text-gray-300 text-sm mb-2"><strong>Sample Code:</strong></p>
                                <pre className="text-gray-200 text-sm overflow-x-auto">
                                  <code>{challenge.sampleCode}</code>
                                </pre>
                              </div>
                            )}
                          </div>
                        )) || <p className="text-slate-400">No coding challenges generated</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">
                      Configure the interview requirements and click "Generate" to create your interview kit
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
