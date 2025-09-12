'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chrome, Search, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { secureAuthService } from '@/lib/auth-secure';

export default function RecruiterLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if recruiter is already authenticated
    const checkAuth = async () => {
      if (await secureAuthService.isAuthenticated()) {
        router.push('/dashboard/recruiter');
      }
    };
    checkAuth();
  }, [router]);

    const handleGoogleLogin = () => {
    setIsLoading(true);
    try {
      secureAuthService.redirectToGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-600/20 rounded-full">
              <Search className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Recruiter Portal</h1>
          <p className="text-slate-300">Find and assess top developers with AI insights</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Chrome className="w-5 h-5" />
              Sign in with Google
            </CardTitle>
            <CardDescription className="text-slate-300">
              Access advanced candidate search and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features showcase */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Advanced candidate search</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">AI-powered skill assessment</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Portfolio analytics & insights</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="text-slate-300">Candidate shortlisting & management</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
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
                  <Chrome className="w-4 h-4" />
                  Continue with Google
                </div>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Are you a developer?{' '}
                <button
                  onClick={() => router.push('/auth/developer/login')}
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
