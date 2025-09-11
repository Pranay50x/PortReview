'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Code, GitBranch, Users, Zap } from 'lucide-react';
import { githubAuthService } from '@/lib/auth-github';

export default function DeveloperLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if developer is already authenticated
    if (githubAuthService.isAuthenticated()) {
      router.push('/dashboard/developer');
    }
  }, [router]);

  const handleGitHubLogin = () => {
    console.log('=== Developer Login - GitHub OAuth ===');
    setIsLoading(true);
    
    try {
      githubAuthService.redirectToGitHub();
    } catch (error) {
      console.error('GitHub login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600/20 rounded-full">
              <Code className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Developer Portal</h1>
          <p className="text-slate-300">Showcase your code, get AI-powered insights</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </CardTitle>
            <CardDescription className="text-slate-300">
              Connect your GitHub account to auto-generate your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features showcase */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <GitBranch className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Auto-analyze your repositories</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">AI-powered portfolio generation</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Get discovered by recruiters</span>
              </div>
            </div>

            <Button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 transition-all duration-200 hover:border-slate-500"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Continue with GitHub
                </div>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Are you a recruiter?{' '}
                <button
                  onClick={() => router.push('/auth/recruiter/login')}
                  className="text-blue-400 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
