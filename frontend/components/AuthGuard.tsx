'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser, type User } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'developer' | 'recruiter';
}

export default function AuthGuard({ children, requiredUserType }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      if (requiredUserType && currentUser.user_type !== requiredUserType) {
        // Redirect to correct dashboard
        router.push(`/dashboard/${currentUser.user_type}`);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [router, requiredUserType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-slate-300">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
