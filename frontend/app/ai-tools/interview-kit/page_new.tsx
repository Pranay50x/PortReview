'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Clock,
  Star,
  Target,
  ArrowLeft,
  Download,
  RefreshCw,
  FileText,
  Users,
  Award
} from 'lucide-react';
import { generateInterviewKit } from '@/lib/ai-agents';
import AuthGuard from '@/components/AuthGuard';

// Mock candidates and roles for interview kit generation
const mockRoles = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    level: 'Senior',
    skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL'],
    experience: '5+ years'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    department: 'Engineering',
    level: 'Mid-Senior',
    skills: ['Node.js', 'React', 'Python', 'PostgreSQL', 'AWS'],
    experience: '3-5 years'
  },
  {
    id: '3',
    title: 'UX Designer',
    department: 'Design',
    level: 'Mid-level',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    experience: '3-4 years'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    department: 'Engineering',
    level: 'Senior',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Docker'],
    experience: '4+ years'
  }
];

export default function InterviewKitPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(mockRoles[0]);
  const [interviewKit, setInterviewKit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roles] = useState(mockRoles);

  // Auto-generate kit for first role on load
  useEffect(() => {
    handleGenerate();
  }, []);

  // Auto-generate when role changes
  useEffect(() => {
    if (selectedRole) {
      handleGenerate();
    }
  }, [selectedRole]);

  const handleGenerate = async () => {
    if (!selectedRole) return;
    
    setIsGenerating(true);
    try {
      const result = await generateInterviewKit({
        candidate: {
          role: selectedRole.title,
          skills: selectedRole.skills,
          experience: selectedRole.experience,
          level: selectedRole.level
        },
        requirements: `${selectedRole.title} with ${selectedRole.experience} experience in ${selectedRole.skills.join(', ')}`
      });
      
      if (typeof result === 'string') {
        setInterviewKit(result);
      } else {
        setInterviewKit(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error generating interview kit:', error);
      // Fallback interview kit for demo
      setInterviewKit(`# Interview Kit: ${selectedRole.title}

## Interview Structure (60 minutes)

### 1. Introduction & Background (10 minutes)
- Tell me about yourself and your journey into ${selectedRole.department.toLowerCase()}
- What interests you most about this ${selectedRole.title} role?
- Walk me through your most challenging project

### 2. Technical Questions (25 minutes)

#### Core Technologies
${selectedRole.skills.map(skill => `- **${skill}**: Describe your experience and a specific project where you used this`).join('\n')}

#### Scenario-Based Questions
- How would you approach building a scalable ${selectedRole.title.includes('Frontend') ? 'user interface' : 'system architecture'}?
- Describe a time when you had to debug a complex issue. Walk me through your process.
- How do you stay updated with the latest trends in ${selectedRole.department.toLowerCase()}?

### 3. Problem-Solving (15 minutes)
- **Code Review**: Present a piece of code and ask for improvements
- **System Design**: Design a ${selectedRole.title.includes('Frontend') ? 'component architecture' : 'simple system'}
- **Best Practices**: Discuss coding standards and team collaboration

### 4. Cultural Fit & Questions (10 minutes)
- How do you handle tight deadlines and competing priorities?
- Describe your ideal working environment and team structure
- What questions do you have about our team, culture, or projects?

## Evaluation Criteria

### Technical Skills (40%)
- [ ] Proficiency in ${selectedRole.skills.slice(0, 3).join(', ')}
- [ ] Problem-solving approach
- [ ] Code quality awareness

### Experience Level (30%)
- [ ] Relevant ${selectedRole.experience} experience
- [ ] Project complexity and impact
- [ ] Leadership/mentoring (for senior roles)

### Communication (20%)
- [ ] Clear technical explanations
- [ ] Asking clarifying questions
- [ ] Team collaboration mindset

### Cultural Fit (10%)
- [ ] Values alignment
- [ ] Growth mindset
- [ ] Enthusiasm for the role

## Red Flags to Watch For
- Unable to explain past projects clearly
- No questions about the role or company
- Dismissive of team practices or feedback

## Follow-up Actions
- [ ] Schedule technical round (if applicable)
- [ ] Reference checks
- [ ] Team meet & greet
- [ ] Offer discussion`);
    }
    setIsGenerating(false);
  };

  const downloadKit = () => {
    if (!selectedRole || !interviewKit) return;
    
    const element = document.createElement("a");
    const file = new Blob([interviewKit], { type: 'text/plain' });
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Role Selection */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Select Role
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Choose a role to generate interview kit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                        selectedRole?.id === role.id
                          ? 'bg-blue-600/20 border-blue-500/40'
                          : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="space-y-2">
                        <h3 className="text-white font-medium">{role.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                            {role.department}
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                            {role.level}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{role.experience}</p>
                        <div className="flex flex-wrap gap-1">
                          {role.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {skill}
                            </Badge>
                          ))}
                          {role.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              +{role.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Interview Kit Results */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      Interview Kit
                      {selectedRole && (
                        <Badge className="ml-2 bg-blue-600/20 text-blue-300">
                          {selectedRole.title}
                        </Badge>
                      )}
                    </CardTitle>
                    {interviewKit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadKit}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Kit
                      </Button>
                    )}
                  </div>
                  {selectedRole && (
                    <CardDescription className="text-slate-300">
                      Comprehensive interview guide for {selectedRole.title} position
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                      <p className="text-white text-lg">AI is crafting your interview kit...</p>
                      <p className="text-slate-400 text-sm">Generating questions, evaluation criteria, and structure</p>
                    </div>
                  ) : interviewKit ? (
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {interviewKit}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <MessageSquare className="w-12 h-12 text-slate-400" />
                      <p className="text-slate-400 text-lg">Select a role to generate interview kit</p>
                      <p className="text-slate-500 text-sm">AI will create structured questions and evaluation criteria</p>
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
