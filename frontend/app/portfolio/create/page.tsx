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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">PortReviewer</div>
            <Button variant="ghost" onClick={() => router.back()}>
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
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className={`h-1 w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Basic Info</span>
              <span>GitHub Analysis</span>
              <span>AI Insights</span>
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Create Your Portfolio</CardTitle>
                <CardDescription>
                  Let's start by setting up your basic portfolio information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); startGitHubAnalysis(); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Portfolio Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Full-Stack Developer Portfolio"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of your expertise and passion..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-24"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUsername">GitHub Username</Label>
                    <Input
                      id="githubUsername"
                      name="githubUsername"
                      placeholder="your-github-username"
                      value={formData.githubUsername}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-sm text-gray-600">
                      We'll analyze your public repositories to generate insights
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="isPublic">Make portfolio public</Label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Continue to GitHub Analysis →
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Analyzing Your GitHub</CardTitle>
                <CardDescription>
                  Our AI is analyzing your repositories and code quality...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">✓ Fetching repositories</div>
                    <div className="text-sm text-gray-600">✓ Analyzing code quality</div>
                    <div className="text-sm text-gray-600">⏳ Processing contribution patterns</div>
                    <div className="text-sm text-gray-500">⏳ Generating AI insights</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">What we're analyzing:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PartyPopper className="w-6 h-6 text-emerald-500" />
                  Portfolio Created Successfully!
                </CardTitle>
                <CardDescription>
                  Your AI-powered portfolio is ready with personalized insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">87</div>
                    <div className="text-sm text-green-700">Code Quality Score</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-700">Projects Analyzed</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Key Strengths Identified
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-700">Frontend Development</Badge>
                      <Badge variant="default" className="bg-green-100 text-green-700">API Design</Badge>
                      <Badge variant="default" className="bg-green-100 text-green-700">Code Organization</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Career Recommendations
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        Consider Senior Frontend Engineer roles
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        Full-Stack Team Lead positions match your profile
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Complete Setup'}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)}>
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
