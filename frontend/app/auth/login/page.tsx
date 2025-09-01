'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Login() {
  const [userType, setUserType] = useState<'developer' | 'recruiter'>('developer');

  const handleGitHubLogin = async (type: 'developer' | 'recruiter') => {
    // GitHub OAuth URL - this will be connected to your backend
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'user:email,read:user';
    const state = `${type}_${Math.random().toString(36).substring(7)}`;
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    // Store user type in localStorage for callback
    localStorage.setItem('auth_user_type', type);
    
    window.location.href = githubAuthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            PortReviewer
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in with GitHub to continue</p>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setUserType('developer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'developer'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👨‍💻 Developer
          </button>
          <button
            onClick={() => setUserType('recruiter')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'recruiter'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 Recruiter
          </button>
        </div>

        {/* Login Cards */}
        {userType === 'developer' ? (
          <Card className="border-2 border-blue-200">
            <CardHeader className="text-center space-y-3">
              <div className="text-4xl">👨‍💻</div>
              <CardTitle className="text-blue-600">Developer Login</CardTitle>
              <CardDescription>
                Transform your GitHub profile into a professional portfolio
              </CardDescription>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Portfolio Generation</Badge>
                <Badge variant="secondary">Code Analysis</Badge>
                <Badge variant="secondary">Career Insights</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleGitHubLogin('developer')}
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
              <div className="text-center text-sm text-gray-600">
                Create your professional developer portfolio in minutes
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-green-200">
            <CardHeader className="text-center space-y-3">
              <div className="text-4xl">🎯</div>
              <CardTitle className="text-green-600">Recruiter Login</CardTitle>
              <CardDescription>
                Access intelligent candidate screening and analysis tools
              </CardDescription>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Smart Screening</Badge>
                <Badge variant="secondary">Code Quality</Badge>
                <Badge variant="secondary">Team Matching</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleGitHubLogin('recruiter')}
                className="w-full bg-green-600 hover:bg-green-700" 
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
              <div className="text-center text-sm text-gray-600">
                Find the perfect developers with AI-powered insights
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
