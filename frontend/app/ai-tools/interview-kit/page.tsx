'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Target,
  ArrowLeft,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Users,
  Code,
  Brain
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { recruitmentAIService, type InterviewKit } from '@/lib/recruitment-ai-service';
import { createInterviewKitPDF } from '@/lib/pdf-utils';

// Comprehensive role templates for interview kit generation
const roleTemplates = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    level: 'Senior',
    skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL', 'Testing'],
    experience: '5+ years',
    responsibilities: [
      'Build scalable frontend applications',
      'Lead frontend architecture decisions',
      'Mentor junior developers',
      'Collaborate with design and backend teams'
    ]
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    department: 'Engineering',
    level: 'Mid-Senior',
    skills: ['Node.js', 'React', 'Python', 'PostgreSQL', 'AWS', 'API Design'],
    experience: '3-5 years',
    responsibilities: [
      'Develop full-stack applications',
      'Design and implement APIs',
      'Optimize database performance',
      'Deploy and maintain cloud infrastructure'
    ]
  },
  {
    id: '3',
    title: 'UX Designer',
    department: 'Design',
    level: 'Mid-level',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    experience: '3-4 years',
    responsibilities: [
      'Conduct user research and usability testing',
      'Create wireframes and prototypes',
      'Maintain design systems',
      'Collaborate with product and engineering teams'
    ]
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    department: 'Engineering',
    level: 'Senior',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Docker', 'Monitoring'],
    experience: '4+ years',
    responsibilities: [
      'Manage cloud infrastructure',
      'Implement CI/CD pipelines',
      'Monitor system performance',
      'Ensure security and compliance'
    ]
  },
  {
    id: '5',
    title: 'Product Manager',
    department: 'Product',
    level: 'Senior',
    skills: ['Product Strategy', 'Analytics', 'User Research', 'Roadmapping', 'Stakeholder Management'],
    experience: '4+ years',
    responsibilities: [
      'Define product strategy and roadmap',
      'Gather and analyze user feedback',
      'Coordinate cross-functional teams',
      'Track and optimize product metrics'
    ]
  },
  {
    id: '6',
    title: 'Data Scientist',
    department: 'Data',
    level: 'Mid-Senior',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Data Visualization'],
    experience: '3-5 years',
    responsibilities: [
      'Develop predictive models',
      'Analyze complex datasets',
      'Create data visualizations',
      'Collaborate with engineering on ML implementations'
    ]
  }
];

export default function InterviewKitPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(roleTemplates[0]);
  const [interviewKit, setInterviewKit] = useState<InterviewKit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Auto-generate kit for first role on load
  useEffect(() => {
    if (selectedRole && aiStatus !== 'checking') {
      handleGenerate();
    }
  }, [aiStatus, selectedRole]);

  const handleGenerate = async () => {
    if (!selectedRole) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Create mock candidate profile for the role
      const candidateProfile = {
        id: '1',
        name: 'Candidate for Analysis',
        role: selectedRole.title,
        experience: selectedRole.experience,
        location: 'Remote',
        skills: selectedRole.skills,
        summary: `Experienced ${selectedRole.title} with ${selectedRole.experience} of experience`,
        github_username: 'example-candidate'
      };

      const jobRequirements = {
        role: selectedRole.title,
        skills: selectedRole.skills,
        experience: selectedRole.experience,
        responsibilities: selectedRole.responsibilities
      };

      const kit = await recruitmentAIService.createInterviewKit(candidateProfile, jobRequirements);
      setInterviewKit(kit);
      setAiStatus('available');
    } catch (err) {
      console.error('Failed to generate interview kit:', err);
      setError('Failed to generate interview kit. Please try again.');
      setAiStatus('fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadKit = () => {
    if (!selectedRole || !interviewKit) return;
    
    createInterviewKitPDF(selectedRole.title, interviewKit);
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
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h1 className="text-xl font-semibold text-white">AI Interview Kit Generator</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            {/* Role Selection - Full Width */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Select Role & Generate Interview Kit
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Choose a role to generate a comprehensive interview kit with AI-powered questions
                    </CardDescription>
                  </div>
                  
                  {/* AI Status Indicator */}
                  <div className="flex items-center gap-2">
                    {aiStatus === 'checking' && (
                      <>
                        <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                        <span className="text-xs text-yellow-400">Checking AI...</span>
                      </>
                    )}
                    {aiStatus === 'available' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">AI Available</span>
                      </>
                    )}
                    {aiStatus === 'fallback' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">Enhanced Fallback</span>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roleTemplates.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedRole?.id === role.id
                          ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/80 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex flex-col">
                        <h3 className="text-white font-medium mb-1">{role.title}</h3>
                        <p className="text-slate-400 text-sm mb-2">{role.department} • {role.level}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {role.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {role.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{role.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{role.experience}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedRole}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Kit...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Interview Kit
                      </>
                    )}
                  </Button>
                  
                  {interviewKit && (
                    <Button
                      onClick={downloadKit}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interview Kit Display - Full Width */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">Interview Kit Generation Error</span>
                </div>
                <p className="text-xs text-red-200 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate()}
                  className="mt-2 border-red-600 text-red-300 hover:bg-red-900/30"
                >
                  Retry Generation
                </Button>
              </div>
            )}

            {isGenerating ? (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <p className="text-white text-lg text-center">
                      AI is generating your interview kit...
                    </p>
                    <p className="text-slate-400 text-sm text-center">
                      Creating technical questions, behavioral assessments, and coding challenges
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : interviewKit ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Technical Questions */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-blue-400" />
                      Technical Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {interviewKit.technical_questions.map((question, index) => (
                      <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium flex-1 text-sm">{question.question}</h4>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {question.difficulty}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs mb-2">
                          <strong>Skill:</strong> {question.skill}
                        </p>
                        <p className="text-slate-300 text-xs mb-2">
                          <strong>Expected:</strong> {question.expected_answer}
                        </p>
                        {question.follow_ups.length > 0 && (
                          <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Follow-ups:</p>
                            <ul className="text-slate-300 text-xs space-y-1">
                              {question.follow_ups.slice(0, 2).map((followUp, i) => (
                                <li key={i} className="list-disc list-inside">{followUp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Behavioral Questions */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      Behavioral Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {interviewKit.behavioral_questions.map((question, index) => (
                      <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <h4 className="text-white font-medium mb-2 text-sm">{question.question}</h4>
                        <p className="text-slate-400 text-xs mb-2">
                          <strong>Purpose:</strong> {question.purpose}
                        </p>
                        {question.good_answers.length > 0 && (
                          <div className="mb-2">
                            <p className="text-green-400 text-xs font-medium mb-1">Good Answers:</p>
                            <ul className="text-slate-300 text-xs space-y-1">
                              {question.good_answers.slice(0, 2).map((answer, i) => (
                                <li key={i} className="list-disc list-inside">{answer}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {question.red_flags.length > 0 && (
                          <div>
                            <p className="text-red-400 text-xs font-medium mb-1">Red Flags:</p>
                            <ul className="text-slate-300 text-xs space-y-1">
                              {question.red_flags.slice(0, 2).map((flag, i) => (
                                <li key={i} className="list-disc list-inside">{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Coding Challenges */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-400" />
                      Coding Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {interviewKit.coding_challenges.map((challenge, index) => (
                      <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium flex-1 text-sm">{challenge.title}</h4>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge variant="secondary" className="text-xs">
                              {challenge.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {challenge.time_limit}min
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-xs mb-3">{challenge.description}</p>
                        <div>
                          <p className="text-slate-400 text-xs font-medium mb-1">Evaluation:</p>
                          <ul className="text-slate-300 text-xs space-y-1">
                            {challenge.evaluation_criteria.slice(0, 3).map((criteria, i) => (
                              <li key={i} className="list-disc list-inside">{criteria}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <MessageSquare className="w-12 h-12 text-slate-400" />
                    <p className="text-slate-400 text-lg text-center">
                      Select a role to generate an AI-powered interview kit
                    </p>
                    <p className="text-slate-500 text-sm text-center px-4">
                      Our AI will create tailored technical questions, behavioral assessments, and coding challenges
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}