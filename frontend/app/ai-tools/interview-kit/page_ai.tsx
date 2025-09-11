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
    
    // Convert structured interview kit to readable text
    const kitText = `
INTERVIEW KIT: ${selectedRole.title}
${'='.repeat(50)}

TECHNICAL QUESTIONS
==================

${interviewKit.technical_questions.map((q, i) => `
${i + 1}. ${q.question}
   Skill: ${q.skill}
   Difficulty: ${q.difficulty}
   Expected Answer: ${q.expected_answer}
   Follow-ups: ${q.follow_ups.join(', ')}
`).join('\n')}

BEHAVIORAL QUESTIONS
===================

${interviewKit.behavioral_questions.map((q, i) => `
${i + 1}. ${q.question}
   Purpose: ${q.purpose}
   Red Flags: ${q.red_flags.join(', ')}
   Good Answers: ${q.good_answers.join(', ')}
`).join('\n')}

CODING CHALLENGES
================

${interviewKit.coding_challenges.map((c, i) => `
${i + 1}. ${c.title}
   Description: ${c.description}
   Difficulty: ${c.difficulty}
   Time Limit: ${c.time_limit} minutes
   Evaluation Criteria: ${c.evaluation_criteria.join(', ')}
`).join('\n')}

---
Generated by PortReview AI Recruitment System
Role: ${selectedRole.title}
Skills: ${selectedRole.skills.join(', ')}
    `.trim();
    
    const element = document.createElement("a");
    const file = new Blob([kitText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedRole.title.replace(/\s+/g, '_')}_Interview_Kit.txt`;
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
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h1 className="text-xl font-semibold text-white">AI Interview Kit Generator</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Selection */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Select Role
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose a role to generate a comprehensive interview kit
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
                        <span className="text-xs text-green-400">AI Interview Kit Available</span>
                      </>
                    )}
                    {aiStatus === 'fallback' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">Using Enhanced Fallback</span>
                      </>
                    )}
                  </div>

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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{role.title}</h3>
                          <p className="text-slate-400 text-sm mb-2">{role.department} • {role.level}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {role.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {role.skills.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{role.experience}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedRole}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                </CardContent>
              </Card>
            </div>

            {/* Interview Kit Display */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {selectedRole ? `${selectedRole.title} Interview Kit` : 'Interview Kit'}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        AI-generated comprehensive interview questions and challenges
                      </CardDescription>
                    </div>
                    {interviewKit && (
                      <Button
                        onClick={downloadKit}
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
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                      <p className="text-white text-lg text-center">
                        AI is generating your interview kit...
                      </p>
                      <p className="text-slate-400 text-sm text-center">
                        Creating technical questions, behavioral assessments, and coding challenges
                      </p>
                    </div>
                  ) : interviewKit ? (
                    <div className="space-y-6">
                      {/* Technical Questions */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-5 h-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">Technical Questions</h3>
                        </div>
                        <div className="space-y-4">
                          {interviewKit.technical_questions.map((question, index) => (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-white font-medium flex-1">{question.question}</h4>
                                <Badge variant="secondary" className="text-xs ml-2">
                                  {question.difficulty}
                                </Badge>
                              </div>
                              <p className="text-slate-400 text-sm mb-2">
                                <strong>Skill:</strong> {question.skill}
                              </p>
                              <p className="text-slate-300 text-sm mb-2">
                                <strong>Expected Answer:</strong> {question.expected_answer}
                              </p>
                              {question.follow_ups.length > 0 && (
                                <div>
                                  <p className="text-slate-400 text-sm font-medium mb-1">Follow-up Questions:</p>
                                  <ul className="text-slate-300 text-sm space-y-1">
                                    {question.follow_ups.map((followUp, i) => (
                                      <li key={i} className="list-disc list-inside">{followUp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Behavioral Questions */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">Behavioral Questions</h3>
                        </div>
                        <div className="space-y-4">
                          {interviewKit.behavioral_questions.map((question, index) => (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                              <h4 className="text-white font-medium mb-2">{question.question}</h4>
                              <p className="text-slate-400 text-sm mb-2">
                                <strong>Purpose:</strong> {question.purpose}
                              </p>
                              {question.good_answers.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-green-400 text-sm font-medium mb-1">Good Answers Include:</p>
                                  <ul className="text-slate-300 text-sm space-y-1">
                                    {question.good_answers.map((answer, i) => (
                                      <li key={i} className="list-disc list-inside">{answer}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {question.red_flags.length > 0 && (
                                <div>
                                  <p className="text-red-400 text-sm font-medium mb-1">Red Flags:</p>
                                  <ul className="text-slate-300 text-sm space-y-1">
                                    {question.red_flags.map((flag, i) => (
                                      <li key={i} className="list-disc list-inside">{flag}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Coding Challenges */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-semibold text-white">Coding Challenges</h3>
                        </div>
                        <div className="space-y-4">
                          {interviewKit.coding_challenges.map((challenge, index) => (
                            <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-white font-medium flex-1">{challenge.title}</h4>
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
                              <p className="text-slate-300 text-sm mb-3">{challenge.description}</p>
                              <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">Evaluation Criteria:</p>
                                <ul className="text-slate-300 text-sm space-y-1">
                                  {challenge.evaluation_criteria.map((criteria, i) => (
                                    <li key={i} className="list-disc list-inside">{criteria}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <MessageSquare className="w-12 h-12 text-slate-400" />
                      <p className="text-slate-400 text-lg text-center">
                        Select a role to generate an AI-powered interview kit
                      </p>
                      <p className="text-slate-500 text-sm text-center px-4">
                        Our AI will create tailored technical questions, behavioral assessments, and coding challenges
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
