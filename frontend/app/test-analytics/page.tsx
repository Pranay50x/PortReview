'use client';

import { PortfolioAnalytics } from '@/components/PortfolioAnalytics';
import { getCurrentUser } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function TestAnalyticsPage() {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-8">Portfolio Analytics Test</h1>
        
        {/* Test with current user if available */}
        {user?.github_username && (
          <div className="mb-8">
            <h2 className="text-white text-xl font-semibold mb-4">Your Portfolio Analytics</h2>
            <PortfolioAnalytics githubUsername={user.github_username} />
          </div>
        )}
        
        {/* Test with a demo GitHub username */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">Demo Analytics (PranayKr)</h2>
          <PortfolioAnalytics githubUsername="pranaykr" />
        </div>
        
        {/* Test without GitHub username */}
        <div className="mt-8">
          <h2 className="text-white text-xl font-semibold mb-4">Without GitHub Username</h2>
          <PortfolioAnalytics />
        </div>
      </div>
    </div>
  );
}
