'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check what type of OAuth flow this is
    const flowType = localStorage.getItem('auth_flow_type');
    const code = searchParams.get('code');
    
    console.log('=== Legacy Auth Callback Redirect ===');
    console.log('Flow type:', flowType);
    console.log('Code present:', code ? 'Yes' : 'No');
    
    if (flowType === 'github_developer') {
      // Redirect to GitHub callback
      router.push(`/auth/github/callback?${searchParams.toString()}`);
    } else if (flowType === 'google_recruiter') {
      // Redirect to Google callback
      router.push(`/auth/google/callback?${searchParams.toString()}`);
    } else {
      // Default to login chooser
      console.log('No flow type found, redirecting to login chooser');
      router.push('/auth/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}
