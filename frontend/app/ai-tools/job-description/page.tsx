'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw,
  ArrowLeft
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
    const element = document.createElement("a");
    const file = new Blob([generatedJD], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.role}_${formData.company}_JD.txt`;
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
                <FileText className="w-5 h-5 text-emerald-400" />
                <h1 className="text-xl font-semibold text-white">AI Job Description Generator</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
          {/* Input Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI-Powered Job Description
              </CardTitle>
              <CardDescription className="text-slate-300">
                Let our AI create the perfect job description for you
              </CardDescription>
            </CardHeader>
            <CardContent>
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
              </div>
            </CardContent>
          </Card>

          {/* Generated Output */}
          {generatedJD && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Generated Job Description
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadJD}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {generatedJD}
                    </ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
