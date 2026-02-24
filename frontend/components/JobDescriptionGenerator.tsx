// AI Job Description Generator Component
'use client';

import { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { recruitmentAI } from '@/lib/ai-agents';

interface JobDescriptionGeneratorProps {
  onClose?: () => void;
}

export default function JobDescriptionGenerator({ onClose }: JobDescriptionGeneratorProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salaryRange: '',
    experienceLevel: '',
    skills: '',
    description: ''
  });
  const [generatedJD, setGeneratedJD] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const jd = await recruitmentAI.generateJobDescription({
        role: formData.title,
        company: formData.company,
        skills: formData.skills.split(',').map(s => s.trim()),
        experience: formData.experienceLevel,
        location: formData.location
      });
      setGeneratedJD(jd);
    } catch (error) {
      console.error('Failed to generate job description:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedJD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedJD], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.replace(/\s+/g, '_')}_Job_Description.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                AI Job Description Generator
              </CardTitle>
              <CardDescription className="text-slate-300">
                Create compelling job descriptions with AI-powered insights
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                ✕
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior Frontend Developer"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-slate-300">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., TechCorp Inc."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Remote / San Francisco"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary" className="text-slate-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Salary Range
                    </Label>
                    <Input
                      id="salary"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                      placeholder="$120K - $180K"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Experience Level
                  </Label>
                  <Input
                    id="experience"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    placeholder="3-5 years"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="skills" className="text-slate-300">Required Skills (comma-separated)</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js, AWS, GraphQL"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">Additional Context (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Any specific requirements, company culture, or role details..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate}
                  disabled={!formData.title || !formData.company || loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate JD
                    </>
                  )}
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Generated Output */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-300 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generated Job Description
                </h3>
                {generatedJD && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCopy}
                      className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleDownload}
                      className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              <Card className="bg-slate-700/30 border-slate-600/50 min-h-[500px]">
                <CardContent className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <Sparkles className="w-8 h-8 text-green-400 mx-auto animate-pulse" />
                        <div className="text-slate-300">Crafting your job description...</div>
                        <div className="text-sm text-slate-400">Using AI to optimize for candidate attraction</div>
                      </div>
                    </div>
                  ) : generatedJD ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-green-600 text-white">AI Optimized</Badge>
                        <Badge variant="outline" className="border-green-500 text-green-400">SEO Friendly</Badge>
                        <Badge variant="outline" className="border-blue-500 text-blue-400">Inclusive Language</Badge>
                      </div>
                      <div className="text-slate-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {generatedJD}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-center">
                      <div className="space-y-2">
                        <FileText className="w-12 h-12 mx-auto opacity-50" />
                        <div>Fill in the details and click "Generate JD" to create your job description</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
