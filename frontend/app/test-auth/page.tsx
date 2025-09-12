'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { secureAuthService } from '@/lib/auth-secure';

interface AuthStatus {
  authenticated: boolean;
  user?: any;
  error?: string;
}

export default function TestAuth() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      console.log('=== Testing Authentication ===');
      const user = await secureAuthService.getCurrentUser();
      console.log('Auth result:', user);
      
      if (user) {
        setAuthStatus({
          authenticated: true,
          user: user
        });
      } else {
        setAuthStatus({
          authenticated: false,
          error: 'Not authenticated'
        });
      }
    } catch (error) {
      console.error('Auth test error:', error);
      setAuthStatus({
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setLoading(false);
  };

  const testLogout = async () => {
    try {
      await secureAuthService.logout();
      setAuthStatus({ authenticated: false });
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-center">Authentication Test</CardTitle>
          <CardDescription className="text-slate-300 text-center">
            Testing the secure OAuth authentication system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Checking authentication...</p>
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Authentication Status</h3>
                <p className={`text-lg font-mono ${authStatus.authenticated ? 'text-green-400' : 'text-red-400'}`}>
                  {authStatus.authenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}
                </p>
              </div>

              {authStatus.user && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">User Information</h3>
                  <div className="text-slate-300 space-y-1">
                    <p><span className="text-cyan-400">Name:</span> {authStatus.user.name}</p>
                    <p><span className="text-cyan-400">Email:</span> {authStatus.user.email || 'N/A'}</p>
                    <p><span className="text-cyan-400">User Type:</span> {authStatus.user.user_type}</p>
                    <p><span className="text-cyan-400">ID:</span> {authStatus.user.id}</p>
                    {authStatus.user.github_username && (
                      <p><span className="text-cyan-400">GitHub:</span> {authStatus.user.github_username}</p>
                    )}
                  </div>
                </div>
              )}

              {authStatus.error && (
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-600/30">
                  <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                  <p className="text-red-300">{authStatus.error}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button onClick={checkAuth} variant="outline">
                  Refresh Auth Status
                </Button>
                
                {authStatus.authenticated && (
                  <Button onClick={testLogout} variant="destructive">
                    Test Logout
                  </Button>
                )}
                
                {!authStatus.authenticated && (
                  <Button onClick={() => window.location.href = '/auth/login'}>
                    Go to Login
                  </Button>
                )}
              </div>

              <div className="text-center">
                <a href="/" className="text-slate-400 hover:text-white transition-colors">
                  ← Back to Home
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}