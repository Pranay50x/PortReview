'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  FileText, 
  MessageSquare, 
  Users, 
  Sparkles, 
  ArrowLeft,
  Zap,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import SecureAuthGuard from '@/components/SecureAuthGuard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function AIToolsContent() {
  const router = useRouter();

  const tools = [
    {
      id: 'job-description',
      title: 'AI Job Description Generator',
      description: 'Create compelling, optimized job descriptions that attract top talent',
      icon: FileText,
      color: 'from-emerald-600 to-blue-600',
      path: '/ai-tools/job-description',
      features: ['SEO Optimized', 'Inclusive Language', 'Market Competitive', 'ATS Friendly']
    },
    {
      id: 'interview-kit',
      title: 'Interview Kit Generator',
      description: 'Generate customized technical and behavioral interview questions',
      icon: MessageSquare,
      color: 'from-blue-600 to-teal-600',
      path: '/ai-tools/interview-kit',
      features: ['Technical Questions', 'Behavioral Assessment', 'Coding Challenges', 'Answer Guidelines']
    },
    {
      id: 'candidate-analysis',
      title: 'Candidate Analysis',
      description: 'Deep AI-powered analysis of candidate profiles and skills',
      icon: Users,
      color: 'from-purple-600 to-pink-600',
      path: '/ai-tools/candidate-analysis',
      features: ['Skill Assessment', 'Culture Fit', 'Performance Prediction', 'Gap Analysis']
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Get real-time salary insights and competitive benchmarking',
      icon: BarChart3,
      color: 'from-emerald-600 to-green-600',
      path: '/ai-tools/market-analysis',
      features: ['Market Data', 'Location Adjustment', 'Skill Premium', 'Trend Analysis']
    },
    {
      id: 'hiring-prediction',
      title: 'Hiring Prediction Model',
      description: 'AI-powered success probability analysis for candidate hiring decisions',
      icon: Target,
      color: 'from-pink-600 to-red-600',
      path: '/ai-tools/hiring-prediction',
      features: ['Success Prediction', 'Risk Assessment', 'Retention Analysis', 'ROI Calculation']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-slate-900/30 to-slate-800/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard/recruiter')}
                className="text-slate-300 hover:text-emerald-400 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <Brain className="w-6 h-6" />
                AI Recruitment Tools
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-emerald-400" />
            AI-Powered Recruitment Suite
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Revolutionize your hiring process with intelligent tools that save time, 
            improve quality, and help you find the perfect candidates faster.
          </p>
        </div>

        {/* AI Tools Grid - Clean 2x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer hover:scale-105"
              onClick={() => router.push(tool.path)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <tool.icon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-white text-xl mb-3">{tool.title}</CardTitle>
                <CardDescription className="text-slate-300 text-base leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white py-3 font-medium shadow-lg`}
                  onClick={() => router.push(tool.path)}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Launch Tool
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                AI-Powered Intelligence
              </CardTitle>
              <CardDescription className="text-slate-300">
                Advanced machine learning capabilities for smarter recruiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium">Smart Content Generation</div>
                    <div className="text-slate-400 text-sm">Create job descriptions and interview questions tailored to specific roles</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium">Market Intelligence</div>
                    <div className="text-slate-400 text-sm">Real-time salary data and hiring trends analysis</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Recruitment Excellence
              </CardTitle>
              <CardDescription className="text-slate-300">
                Streamline your hiring process with proven methodologies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium">80% Time Savings</div>
                    <div className="text-slate-400 text-sm">Reduce manual work with automated content generation</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium">Better Hiring Decisions</div>
                    <div className="text-slate-400 text-sm">Structured, role-specific questions improve interview quality</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AITools() {
  return (
    <SecureAuthGuard requiredUserType="recruiter">
      <AIToolsContent />
    </SecureAuthGuard>
  );
}
