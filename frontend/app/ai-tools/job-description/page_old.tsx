'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw,
  Settings,
  Zap,
  Users,
  MapPin,
  DollarSign,
  Clock,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { generateJobDescription } from '@/lib/ai-agents';
import AuthGuard from '@/components/AuthGuard';

export default function JobDescriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: '',
    company: ''
  });

  const [generatedJD, setGeneratedJD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!formData.role || !formData.company) return;
    
    setIsGenerating(true);
    try {
      const jdData = {
        role: formData.role,
        company: formData.company,
        location: 'Remote/Hybrid (AI will suggest appropriate location)',
        experience: 'AI will determine optimal experience level',
        skills: [] // AI will generate relevant skills
      };
      const result = await generateJobDescription(jdData);
      setGeneratedJD(result);
    } catch (error) {
      console.error('Error generating job description:', error);
    }
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJD);
  };

  const downloadJD = () => {
    const blob = new Blob([generatedJD], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.role || 'job-description'}.txt`;
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
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl">
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
              <FileText className="w-8 h-8 text-green-400" />
              AI Job Description Generator
            </h1>
            <p className="text-slate-300 mt-2">Create compelling job descriptions with AI assistance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Job Requirements
              </CardTitle>
              <CardDescription className="text-slate-300">
                Fill in the details to generate a professional job description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI-Driven Simple Form */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-white">Let AI craft your perfect job description</h3>
                  <p className="text-slate-300 text-sm">Just tell us the role and company - our AI will handle the rest!</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role" className="text-white text-sm font-medium">What role are you hiring for? *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Senior React Developer, Product Manager, UX Designer..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-white text-sm font-medium">Company Name *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. TechCorp, StartupX..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 mt-2"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-emerald-400 font-medium text-sm">AI Magic ✨</h4>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Our AI will intelligently determine the perfect location, experience requirements, 
                          essential skills, compensation ranges, and write compelling descriptions based on 
                          industry standards and current market trends.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate}
                    disabled={!formData.role || !formData.company || isGenerating}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        AI is crafting your job description...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Perfect Job Description
                      </>
                    )}
                  </Button>
                </div>
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => handleSkillAdd(formData.skills)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {skillTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skillTags.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-600/20 text-green-300">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:text-red-400"
                              title="Remove skill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!formData.role || isGenerating}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    AI is crafting your job description...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-400 text-center">
                Our AI will create a complete, professional job description based on your inputs
              </p>
            </CardContent>
          </Card>

          {/* Generated Output */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Generated Job Description
              </CardTitle>
              <CardDescription className="text-slate-300">
                AI-powered professional job description
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedJD ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-white text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedJD}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={downloadJD}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Fill in the job requirements and click &quot;Generate&quot; to create your job description
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
