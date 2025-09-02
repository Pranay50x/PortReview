'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, Target, Github, Sparkles, AlertCircle } from 'lucide-react';
import { signIn, signInWithGitHub, signUp, validateEmail, validatePassword, isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'developer' | 'recruiter' | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      router.push(`/dashboard/${user.type}`);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        if (!validateEmail(email)) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.errors[0]);
          setLoading(false);
          return;
        }

        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }

        if (userType === 'developer' && !githubUsername.trim()) {
          setError('GitHub username is required for developers');
          setLoading(false);
          return;
        }

        if (userType === 'recruiter' && !company.trim()) {
          setError('Company name is required for recruiters');
          setLoading(false);
          return;
        }

        const result = await signUp(
          name,
          email,
          password,
          userType!,
          githubUsername,
          company
        );

        if (result.success) {
          router.push(`/dashboard/${userType}`);
        } else {
          setError(result.error || 'Sign up failed');
        }
      } else {
        // Sign in
        const result = await signIn(email, password);
        
        if (result.success) {
          router.push(`/dashboard/${result.user!.type}`);
        } else {
          setError(result.error || 'Sign in failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGitHub(userType!);
      
      if (result.success) {
        router.push(`/dashboard/${userType}`);
      } else {
        setError(result.error || 'GitHub sign in failed');
      }
    } catch (err) {
      setError('GitHub sign in failed');
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              Welcome to PortReviewer
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </h1>
            <p className="text-xl text-slate-300">Choose your role to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Developer Card */}
            <Card 
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setUserType('developer')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code className="w-10 h-10 text-cyan-400" />
                </div>
                <CardTitle className="text-2xl text-white">I'm a Developer</CardTitle>
                <CardDescription className="text-slate-300">
                  Showcase your coding skills and get professional portfolio reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserType('developer');
                  }}
                >
                  Continue as Developer
                </Button>
              </CardContent>
            </Card>

            {/* Recruiter Card */}
            <Card 
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setUserType('recruiter')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-teal-500/20 to-green-500/20 w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-10 h-10 text-teal-400" />
                </div>
                <CardTitle className="text-2xl text-white">I'm a Recruiter</CardTitle>
                <CardDescription className="text-slate-300">
                  Find top talent and review developer portfolios with AI insights
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserType('recruiter');
                  }}
                >
                  Continue as Recruiter
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-400">
              Don't have an account? 
              <span className="text-cyan-400 ml-2 hover:text-cyan-300 cursor-pointer">
                Sign up here
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 w-16 h-16 flex items-center justify-center">
              {userType === 'developer' ? (
                <Code className="w-8 h-8 text-cyan-400" />
              ) : (
                <Target className="w-8 h-8 text-teal-400" />
              )}
            </div>
            <CardTitle className="text-2xl text-white">
              {userType === 'developer' ? 'Developer' : 'Recruiter'} {isSignUp ? 'Sign Up' : 'Login'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {isSignUp ? 'Create your account to get started' : 'Sign in to your account to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-center gap-2 text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
                {isSignUp && (
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>At least 8 characters</li>
                      <li>One uppercase and lowercase letter</li>
                      <li>One number and one special character</li>
                    </ul>
                  </div>
                )}
              </div>

              {isSignUp && userType === 'developer' && (
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-slate-300">GitHub Username</Label>
                  <Input
                    id="github"
                    type="text"
                    placeholder="Your GitHub username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              )}

              {isSignUp && userType === 'recruiter' && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-300">Company</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your company name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                disabled={loading}
                className={`w-full text-white ${
                  userType === 'developer' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                    : 'bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500'
                } disabled:opacity-50`}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/50 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={handleGitHubLogin}
            >
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setUserType(null)}
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                ← Back to role selection
              </button>
              <div className="text-sm text-slate-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setEmail('');
                    setPassword('');
                    setName('');
                    setGithubUsername('');
                    setCompany('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
