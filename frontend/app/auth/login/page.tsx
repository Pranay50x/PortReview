'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Chrome, Code, Search, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { secureAuthService } from '@/lib/auth-secure';

export default function SecureLoginChooser() {
  const [loading, setLoading] = useState<'github' | 'google' | null>(null);

  const handleGitHubLogin = async () => {
    setLoading('github');
    try {
      secureAuthService.redirectToGitHub();
    } catch (error) {
      console.error('GitHub login failed:', error);
      setLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      secureAuthService.redirectToGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Secure Portal</h1>
          </div>
          <p className="text-xl text-slate-300">Enhanced security with httpOnly cookies & CSRF protection</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Developer Card */}
          <Card className="group bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-600/20 rounded-full group-hover:bg-blue-600/30 transition-colors">
                  <Code className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">I'm a Developer</CardTitle>
              <CardDescription className="text-slate-300">
                Showcase your GitHub projects with secure authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span>Secure GitHub OAuth</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>httpOnly cookie authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>AI code analysis</span>
                </div>
              </div>
              <Button 
                onClick={handleGitHubLogin}
                disabled={loading === 'github'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loading === 'github' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Github className="w-4 h-4 mr-2" />
                )}
                {loading === 'github' ? 'Connecting...' : 'Sign in with GitHub'}
              </Button>
            </CardContent>
          </Card>

          {/* Recruiter Card */}
          <Card className="group bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-600/20 rounded-full group-hover:bg-green-600/30 transition-colors">
                  <Search className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">I'm a Recruiter</CardTitle>
              <CardDescription className="text-slate-300">
                Find developers with secure AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Chrome className="w-4 h-4" />
                  <span>Secure Google OAuth</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>CSRF protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  <span>AI-powered assessments</span>
                </div>
              </div>
              <Button 
                onClick={handleGoogleLogin}
                disabled={loading === 'google'}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {loading === 'google' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Chrome className="w-4 h-4 mr-2" />
                )}
                {loading === 'google' ? 'Connecting...' : 'Sign in with Google'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
