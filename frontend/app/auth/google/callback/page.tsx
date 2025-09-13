'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, Chrome, Loader2 } from 'lucide-react';
import { secureAuthService } from '@/lib/auth-secure';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your Google login...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent duplicate calls - check both state and session storage
    if (hasProcessed) return;
    
    const sessionKey = 'google_callback_processing';
    if (sessionStorage.getItem(sessionKey)) {
      console.log('Google callback already processing, skipping duplicate call');
      return;
    }
    
    const handleCallback = async () => {
      setHasProcessed(true);
      sessionStorage.setItem(sessionKey, 'true');
      
      try {
        console.log('=== Google OAuth Callback (Recruiter) ===');
        console.log('Full URL:', window.location.href);
        console.log('Search params:', searchParams.toString());
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('OAuth params:', { code: code ? 'Present' : 'Missing', state, error });

        if (error) {
          console.error('OAuth error from Google:', error);
          setStatus('error');
          setMessage('Google authentication was cancelled or failed.');
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          setStatus('error');
          setMessage('No authorization code received from Google.');
          return;
        }

        console.log('Processing Google OAuth callback for recruiter...');
        const result = await secureAuthService.handleGoogleCallback(code);

        if (result.success && result.user) {
          setStatus('success');
          setMessage('Recruiter login successful! Redirecting to your dashboard...');
          
          console.log('=== Google OAuth Success (Recruiter) ===');
          console.log('Authenticated recruiter:', result.user.name);
          console.log('Email:', result.user.email);
          console.log('Redirecting to: /dashboard/recruiter');
          
          // Give more time for cookie to be set and processed
          setTimeout(() => {
            router.push('/dashboard/recruiter');
          }, 1500);
        } else {
          console.error('Google OAuth failed:', result.error);
          setStatus('error');
          setMessage(result.error || 'Google authentication failed.');
        }
        } catch (error) {
          console.error('Google auth callback error:', error);
          setStatus('error');
          setMessage('An unexpected error occurred during Google authentication.');
        } finally {
          // Clean up session storage on completion
          setTimeout(() => {
            sessionStorage.removeItem(sessionKey);
          }, 2000);
        }
      };

      handleCallback();
    }, [searchParams, router, hasProcessed]);  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Clock className="w-12 h-12 text-green-400 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-12 h-12 text-green-400" />}
            {status === 'error' && <XCircle className="w-12 h-12 text-red-400" />}
          </div>
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Chrome className="w-5 h-5" />
            {status === 'loading' && 'Authenticating with Google...'}
            {status === 'success' && 'Welcome Recruiter!'}
            {status === 'error' && 'Google Authentication Failed'}
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

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
          </div>
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Chrome className="w-5 h-5" />
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

export default function GoogleCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
