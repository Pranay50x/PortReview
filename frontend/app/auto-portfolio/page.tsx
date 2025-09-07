"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoPortfolioRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new location
    router.replace('/dashboard/auto-portfolio');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to Auto-Portfolio Generator...</p>
      </div>
    </div>
  );
}
