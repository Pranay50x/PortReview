'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Target,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

// Mock roles for interview kit generation
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
    
    // Create structured interview kit
    const skillsList = selectedRole.skills.map(skill => 
      `- **${skill}**: Describe your experience and a specific project where you used this`
    ).join('\n');
    
    const topSkills = selectedRole.skills.slice(0, 3).join(', ');
    const dept = selectedRole.department.toLowerCase();
    const isDesign = selectedRole.title.includes('Design');
    const isFrontend = selectedRole.title.includes('Frontend');
    
    const interviewContent = `# Interview Kit: ${selectedRole.title}

## Interview Structure (60 minutes)

### 1. Introduction & Background (10 minutes)
- Tell me about yourself and your journey into ${dept}
- What interests you most about this ${selectedRole.title} role?
- Walk me through your most challenging project

### 2. Technical Questions (25 minutes)

#### Core Technologies
${skillsList}

#### Scenario-Based Questions
${isDesign ? 
  '- How would you approach designing a user-friendly interface for a complex application?\n- Describe your design process from research to final implementation\n- How do you ensure accessibility in your designs?' :
  `- How would you approach building a scalable ${isFrontend ? 'user interface' : 'system architecture'}?\n- Describe a time when you had to debug a complex issue. Walk me through your process.\n- How do you stay updated with the latest trends in ${dept}?`
}

### 3. Problem-Solving (15 minutes)
${isDesign ?
  '- **Design Challenge**: Redesign a common interface element\n- **User Research**: How would you validate design decisions?\n- **Collaboration**: How do you work with developers and stakeholders?' :
  '- **Code Review**: Present a piece of code and ask for improvements\n- **System Design**: Design a simple system architecture\n- **Best Practices**: Discuss coding standards and team collaboration'
}

### 4. Cultural Fit & Questions (10 minutes)
- How do you handle tight deadlines and competing priorities?
- Describe your ideal working environment and team structure
- What questions do you have about our team, culture, or projects?

## Evaluation Criteria

### Technical Skills (40%)
- Proficiency in ${topSkills}
- Problem-solving approach
- ${isDesign ? 'Design thinking and user empathy' : 'Code quality awareness'}

### Experience Level (30%)
- Relevant ${selectedRole.experience} experience
- Project complexity and impact
- Leadership/mentoring (for senior roles)

### Communication (20%)
- Clear technical explanations
- Asking clarifying questions
- Team collaboration mindset

### Cultural Fit (10%)
- Values alignment
- Growth mindset
- Enthusiasm for the role

## Red Flags to Watch For
- Unable to explain past projects clearly
- No questions about the role or company
- Dismissive of team practices or feedback
${isDesign ? '- No user-centered thinking\n- Cannot explain design decisions' : '- Poor coding practices discussion\n- No interest in code quality'}

## Follow-up Actions
- Schedule technical round (if applicable)
- Reference checks
- Team meet & greet
- Offer discussion

---

**Generated for:** ${selectedRole.title}  
**Experience Level:** ${selectedRole.experience}  
**Key Skills:** ${selectedRole.skills.join(', ')}`;

    // Simulate API delay
    setTimeout(() => {
      setInterviewKit(interviewContent);
      setIsGenerating(false);
    }, 1500);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Role Selection */}
            <div className="order-2 lg:order-1 lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-green-400" />
                    Select Role
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-sm">
                    Choose a role to generate interview kit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {mockRoles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        selectedRole?.id === role.id
                          ? 'bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="space-y-2">
                        <h3 className="text-white font-medium text-sm sm:text-base">{role.title}</h3>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm">
                          <Badge variant="secondary" className="bg-green-600/20 text-green-300 text-xs px-1.5 py-0.5">
                            {role.department}
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 text-xs px-1.5 py-0.5">
                            {role.level}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs">{role.experience}</p>
                        <div className="flex flex-wrap gap-1">
                          {role.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs border-slate-600 text-slate-300 px-1.5 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                          {role.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 px-1.5 py-0.5">
                              +{role.skills.length - 2}
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
            <div className="order-1 lg:order-2 lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      Interview Kit
                      {selectedRole && (
                        <Badge className="ml-2 bg-blue-600/20 text-blue-300 text-xs">
                          {selectedRole.title}
                        </Badge>
                      )}
                    </CardTitle>
                    {interviewKit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadKit}
                        className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Kit
                      </Button>
                    )}
                  </div>
                  {selectedRole && (
                    <CardDescription className="text-slate-300 text-sm">
                      Comprehensive interview guide for {selectedRole.title} position
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
                      <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-spin" />
                      <p className="text-white text-base sm:text-lg text-center">AI is crafting your interview kit...</p>
                      <p className="text-slate-400 text-sm text-center">Generating questions, evaluation criteria, and structure</p>
                    </div>
                  ) : interviewKit ? (
                    <div className="bg-slate-900/50 rounded-lg p-3 sm:p-6 border border-slate-700">
                      <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold text-white mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base sm:text-lg font-semibold text-white mb-3 mt-6">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm sm:text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-sm font-medium text-blue-300 mb-2 mt-3">{children}</h4>,
                            p: ({ children }) => <p className="text-slate-300 text-sm sm:text-base mb-3 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="text-slate-300 text-sm sm:text-base mb-3 space-y-1 pl-4">{children}</ul>,
                            ol: ({ children }) => <ol className="text-slate-300 text-sm sm:text-base mb-3 space-y-1 pl-4">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                            code: ({ children }) => <code className="bg-slate-800 text-blue-300 px-1 py-0.5 rounded text-sm">{children}</code>,
                          }}
                        >
                          {interviewKit}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
                      <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />
                      <p className="text-slate-400 text-base sm:text-lg text-center">Select a role to generate interview kit</p>
                      <p className="text-slate-500 text-sm text-center px-4">AI will create structured questions and evaluation criteria</p>
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
