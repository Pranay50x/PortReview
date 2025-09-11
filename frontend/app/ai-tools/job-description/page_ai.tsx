'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  Target
} from 'lucide-react';
import { recruitmentAIService } from '@/lib/recruitment-ai-service';
import AuthGuard from '@/components/AuthGuard';

export default function JobDescriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    location: '',
    experience: '',
    skills: ''
  });

  const [generatedJD, setGeneratedJD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'checking' | 'available' | 'fallback'>('checking');

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

  const handleGenerate = async () => {
    if (!formData.role || !formData.company) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Parse skills from comma-separated string
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];

      const requirements = {
        role: formData.role,
        company: formData.company,
        location: formData.location || 'Remote/Hybrid',
        experience: formData.experience || 'Mid-level',
        skills: skillsArray
      };

      const jobDescription = await recruitmentAIService.generateJobDescription(requirements);
      setGeneratedJD(jobDescription);
      setAiStatus('available');
    } catch (err) {
      console.error('Job description generation failed:', err);
      setError('Failed to generate job description. Please try again.');
      setAiStatus('fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedJD) return;
    
    try {
      await navigator.clipboard.writeText(generatedJD);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadJD = () => {
    if (!generatedJD) return;
    
    const element = document.createElement("a");
    const file = new Blob([generatedJD], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.role.replace(/\s+/g, '_')}_Job_Description.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Animated Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Navigation */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to AI Tools
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h1 className="text-xl font-semibold text-white">AI Job Description Generator</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* AI Status Indicator */}
          <div className="mb-6 flex items-center gap-2">
            {aiStatus === 'checking' && (
              <>
                <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                <span className="text-sm text-yellow-400">Checking AI service...</span>
              </>
            )}
            {aiStatus === 'available' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">AI Job Description Generator Available</span>
              </>
            )}
            {aiStatus === 'fallback' && (
              <>
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400">Using Enhanced Fallback Generator</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Job Requirements
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Provide job details to generate a comprehensive job description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-300">Generation Error</span>
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

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role" className="text-white text-sm font-medium">Job Title</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Senior React Developer, Product Manager..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-white text-sm font-medium">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. TechCorp, StartupXYZ..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-white text-sm font-medium">Location (Optional)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. San Francisco, Remote, Hybrid..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-white text-sm font-medium">Experience Level (Optional)</Label>
                    <Input
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g. Entry-level, 3-5 years, Senior..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="skills" className="text-white text-sm font-medium">Required Skills (Optional)</Label>
                    <Textarea
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="e.g. React, Node.js, TypeScript, AWS, Docker..."
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 mt-2 min-h-[80px]"
                    />
                    <p className="text-xs text-slate-400 mt-1">Separate multiple skills with commas</p>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!formData.role || !formData.company || isGenerating || aiStatus === 'checking'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Job Description...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Job Description
                    </>
                  )}
                </Button>

                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div className="text-center">
                    <Building2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-xs text-slate-400">Company-specific</div>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-xs text-slate-400">Location-aware</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Job Description */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Generated Job Description</CardTitle>
                    <CardDescription className="text-slate-400">
                      AI-crafted job description ready to post
                    </CardDescription>
                  </div>
                  {generatedJD && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={downloadJD}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                    <p className="text-white text-lg text-center">
                      AI is crafting your job description...
                    </p>
                    <p className="text-slate-400 text-sm text-center">
                      Analyzing role requirements and company context
                    </p>
                  </div>
                ) : generatedJD ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 max-h-[600px] overflow-y-auto">
                      <div className="text-slate-200 prose prose-invert prose-sm max-w-none leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {generatedJD}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                        <div className="text-white font-medium">
                          {generatedJD.split(' ').length} words
                        </div>
                        <div className="text-slate-400 text-xs">Word count</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                        <div className="text-white font-medium">
                          ~{Math.ceil(generatedJD.split(' ').length / 200)} min
                        </div>
                        <div className="text-slate-400 text-xs">Reading time</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <FileText className="w-12 h-12 text-slate-400" />
                    <p className="text-slate-400 text-lg text-center">
                      Ready to generate job description
                    </p>
                    <p className="text-slate-500 text-sm text-center px-4">
                      Fill in the job requirements and let AI create a comprehensive job posting
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
