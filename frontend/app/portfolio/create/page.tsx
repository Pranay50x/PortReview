'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, Sparkles, Rocket, Lightbulb } from 'lucide-react';

export default function CreatePortfolio() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubUsername: '',
    email: '',
    linkedin: '',
    website: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Call API to create portfolio
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const portfolio = await response.json();
        router.push(`/portfolio/${portfolio.id}`);
      } else {
        throw new Error('Failed to create portfolio');
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Failed to create portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startGitHubAnalysis = () => {
    setStep(2);
    // Simulate GitHub analysis
    setTimeout(() => {
      setStep(3);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-400">PortReviewer</div>
            <Button variant="ghost" onClick={() => router.back()} className="text-slate-300 hover:text-white">
              ← Back
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                1
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                2
              </div>
              <div className={`h-1 w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-400">
              <span>Basic Info</span>
              <span>GitHub Analysis</span>
              <span>AI Insights</span>
            </div>
          </div>

          {step === 1 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create Your Portfolio</CardTitle>
                <CardDescription className="text-slate-400">
                  Let's start by setting up your basic portfolio information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); startGitHubAnalysis(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-300">Portfolio Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Full-Stack Developer Portfolio"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-300">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of your expertise and passion..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md resize-none h-24 text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUsername" className="text-slate-300">GitHub Username</Label>
                    <Input
                      id="githubUsername"
                      name="githubUsername"
                      placeholder="your-github-username"
                      value={formData.githubUsername}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-400">
                      We'll analyze your public repositories to generate insights
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-slate-300">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        name="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.linkedin || ''}
                        onChange={handleInputChange}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-slate-300">Personal Website</Label>
                      <Input
                        id="website"
                        name="website"
                        placeholder="https://yourwebsite.com"
                        value={formData.website || ''}
                        onChange={handleInputChange}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="isPublic" className="text-slate-300">Make portfolio public</Label>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                    Continue to GitHub Analysis →
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Analyzing Your GitHub</CardTitle>
                <CardDescription className="text-slate-400">
                  Our AI is analyzing your repositories and code quality...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <div className="space-y-2">
                    <div className="text-sm text-emerald-400">✓ Fetching repositories</div>
                    <div className="text-sm text-emerald-400">✓ Analyzing code quality</div>
                    <div className="text-sm text-blue-400">⏳ Processing contribution patterns</div>
                    <div className="text-sm text-slate-400">⏳ Generating AI insights</div>
                  </div>
                </div>

                <div className="bg-blue-950/50 border border-blue-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">What we're analyzing:</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Code quality and complexity</li>
                    <li>• Programming languages and frameworks</li>
                    <li>• Contribution frequency and patterns</li>
                    <li>• Project architecture and best practices</li>
                    <li>• Collaboration and communication style</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <PartyPopper className="w-6 h-6 text-emerald-400" />
                  Portfolio Created Successfully!
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your AI-powered portfolio is ready with personalized insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-950/50 border border-emerald-800 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">87</div>
                    <div className="text-sm text-emerald-300">Code Quality Score</div>
                  </div>
                  <div className="text-center p-4 bg-blue-950/50 border border-blue-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">12</div>
                    <div className="text-sm text-blue-300">Projects Analyzed</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Key Strengths Identified
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="bg-emerald-900/50 text-emerald-300 border-emerald-700">Frontend Development</Badge>
                      <Badge variant="default" className="bg-emerald-900/50 text-emerald-300 border-emerald-700">API Design</Badge>
                      <Badge variant="default" className="bg-emerald-900/50 text-emerald-300 border-emerald-700">Code Organization</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Career Recommendations
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-950/50 border border-blue-800 rounded-lg text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-200">Consider Senior Frontend Engineer roles</span>
                      </div>
                      <div className="p-3 bg-blue-950/50 border border-blue-800 rounded-lg text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-200">Full-Stack Team Lead positions match your profile</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? 'Creating...' : 'Complete Setup'}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
