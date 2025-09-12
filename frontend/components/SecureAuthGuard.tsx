'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { secureAuthService, SecureUser } from '@/lib/auth-secure';

interface SecureAuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'developer' | 'recruiter';
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const SecureAuthGuard: React.FC<SecureAuthGuardProps> = ({
  children,
  requiredUserType,
  redirectTo = '/auth/login',
  fallback = <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
}) => {
  const router = useRouter();
  const [user, setUser] = useState<SecureUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await secureAuthService.isAuthenticated();
        
        if (!authenticated) {
          setLoading(false);
          router.push(redirectTo);
          return;
        }

        const currentUser = await secureAuthService.getCurrentUser();
        
        if (!currentUser) {
          setLoading(false);
          router.push(redirectTo);
          return;
        }

        // Check user type if specified
        if (requiredUserType && currentUser.user_type !== requiredUserType) {
          const redirectPath = currentUser.user_type === 'developer' 
            ? '/dashboard/developer' 
            : '/dashboard/recruiter';
          router.push(redirectPath);
          return;
        }

        setUser(currentUser);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setLoading(false);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo, requiredUserType]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
};

// Hook for accessing current user in components
export const useSecureAuth = () => {
  const [user, setUser] = useState<SecureUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await secureAuthService.isAuthenticated();
        if (authenticated) {
          const currentUser = await secureAuthService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    login: secureAuthService.login.bind(secureAuthService),
    logout: secureAuthService.logout.bind(secureAuthService),
    refreshToken: secureAuthService.refreshToken.bind(secureAuthService)
  };
};

// Component for conditional rendering based on auth state
export const SecureAuthComponent: React.FC<{
  authenticated?: React.ReactNode;
  unauthenticated?: React.ReactNode;
  loading?: React.ReactNode;
}> = ({ authenticated, unauthenticated, loading: loadingComponent }) => {
  const { user, loading, isAuthenticated } = useSecureAuth();

  if (loading) {
    return <>{loadingComponent || <div>Loading...</div>}</>;
  }

  if (isAuthenticated && user) {
    return <>{authenticated}</>;
  }

  return <>{unauthenticated}</>;
};

// HOC for protecting pages
export const withSecureAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    requiredUserType?: 'developer' | 'recruiter';
    redirectTo?: string;
  }
) => {
  const WithSecureAuthComponent = (props: P) => {
    return (
      <SecureAuthGuard 
        requiredUserType={options?.requiredUserType}
        redirectTo={options?.redirectTo}
      >
        <WrappedComponent {...props} />
      </SecureAuthGuard>
    );
  };

  WithSecureAuthComponent.displayName = `withSecureAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithSecureAuthComponent;
};

export default SecureAuthGuard;