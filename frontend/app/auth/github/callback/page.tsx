'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, Github, Loader2 } from 'lucide-react';
import { secureAuthService } from '@/lib/auth-secure';

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your secure GitHub login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== Secure GitHub OAuth Callback (Developer) ===');
        console.log('Full URL:', window.location.href);
        console.log('Search params:', searchParams.toString());
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('OAuth params:', { code: code ? 'Present' : 'Missing', state, error });

        if (error) {
          console.error('OAuth error from GitHub:', error);
          setStatus('error');
          setMessage('GitHub authentication was cancelled or failed.');
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          setStatus('error');
          setMessage('No authorization code received from GitHub.');
          return;
        }

        console.log('Processing secure GitHub OAuth callback for developer...');
        const result = await secureAuthService.handleGitHubCallback(code, state || undefined);

        console.log('handleGitHubCallback result:', result);

        if (result.success && result.user) {
          setStatus('success');
          setMessage('Secure developer login successful! Redirecting to your dashboard...');
          
          console.log('=== Secure GitHub OAuth Success (Developer) ===');
          console.log('Authenticated developer:', result.user.name);
          console.log('GitHub username:', result.user.github_username);
          console.log('Redirecting to: /dashboard/developer');
          
          // Give more time for cookie to be set and processed
          setTimeout(() => {
            router.push('/dashboard/developer');
          }, 2000);
        } else {
          console.error('Secure GitHub OAuth failed:', result.error);
          console.error('Full result object:', result);
          setStatus('error');
          setMessage(result.error || 'GitHub authentication failed.');
        }
      } catch (error) {
        console.error('Secure GitHub auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during GitHub authentication.');
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
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Github className="w-5 h-5" />
            {status === 'loading' && 'Authenticating with GitHub...'}
            {status === 'success' && 'Welcome Developer!'}
            {status === 'error' && 'GitHub Authentication Failed'}
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
                onClick={() => router.push('/auth/developer/login')}
                className="text-blue-400 hover:underline"
              >
                Return to Developer Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          </div>
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Github className="w-5 h-5" />
            Loading...
          </CardTitle>
          <CardDescription className="text-slate-300">
            Preparing authentication...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function GitHubCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GitHubCallbackContent />
    </Suspense>
  );
}
