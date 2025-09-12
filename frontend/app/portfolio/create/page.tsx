'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatePortfolioPage() {
  useEffect(() => {
    // Redirect to auto-portfolio creation page
    redirect('/dashboard/auto-portfolio');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Portfolio Creation...</h1>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
