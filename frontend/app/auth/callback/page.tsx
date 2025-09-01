'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        const userType = localStorage.getItem('auth_user_type') || 'developer';
        
        // Send code to backend for token exchange
        const response = await fetch('/api/auth/github/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
            userType,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store JWT token
          localStorage.setItem('auth_token', data.token);
          localStorage.removeItem('auth_user_type');
          
          setStatus('success');
          setMessage('Login successful! Redirecting...');
          
          // Redirect based on user type
          setTimeout(() => {
            if (userType === 'developer') {
              router.push('/dashboard/developer');
            } else {
              router.push('/dashboard/recruiter');
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Authentication failed.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">
            {status === 'loading' && '⏳'}
            {status === 'success' && '✅'}
            {status === 'error' && '❌'}
          </div>
          <CardTitle>
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Welcome to PortReviewer!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="animate-pulse space-y-2">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please try logging in again, or contact support if the problem persists.
              </p>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:underline"
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
