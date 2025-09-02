'use client';

import { PortfolioAnalytics } from '@/components/PortfolioAnalytics';

export default function TestAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-8">Portfolio Analytics Test</h1>
        
        {/* Test with a GitHub username */}
        <PortfolioAnalytics githubUsername="octocat" />
        
        {/* Test without GitHub username */}
        <div className="mt-8">
          <h2 className="text-white text-xl font-semibold mb-4">Without GitHub Username</h2>
          <PortfolioAnalytics />
        </div>
      </div>
    </div>
  );
}
