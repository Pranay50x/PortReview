'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '@/lib/auth';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('GitHub authentication was cancelled or failed.');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from GitHub.');
          return;
        }

        // Get user type from localStorage
        const userType = (localStorage.getItem('auth_user_type') || 'developer') as 'developer' | 'recruiter';
        
        // Use frontend auth service for GitHub OAuth
        const result = await authService.handleGitHubCallback(code);

        if (result.success && result.user) {
          localStorage.removeItem('auth_user_type');
          
          setStatus('success');
          setMessage('Login successful! Redirecting...');
          
          console.log('OAuth success, user:', result.user);
          console.log('Redirecting to:', `/dashboard/${result.user.user_type}`);
          
          // Immediate redirect instead of timeout
          router.push(`/dashboard/${result.user.user_type}`);
        } else {
          console.error('OAuth failed:', result.error);
          setStatus('error');
          setMessage(result.error || 'Authentication failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
        console.error('Auth callback error:', error);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Clock className="w-12 h-12 text-blue-400 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-12 h-12 text-green-400" />}
            {status === 'error' && <XCircle className="w-12 h-12 text-red-400" />}
          </div>
          <CardTitle className="text-white">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Welcome to PortReviewer!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription className="text-slate-300">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="animate-pulse space-y-2">
              <div className="h-2 bg-slate-600 rounded"></div>
              <div className="h-2 bg-slate-600 rounded w-3/4"></div>
              <div className="h-2 bg-slate-600 rounded w-1/2"></div>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Please try logging in again, or contact support if the problem persists.
              </p>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-400 hover:underline"
              >
                Return to Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
