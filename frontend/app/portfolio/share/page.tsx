'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Copy, 
  Share2, 
  Twitter, 
  Linkedin, 
  Github,
  Mail,
  Link as LinkIcon,
  CheckCircle,
  QrCode,
  Download,
  ArrowLeft
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentUser, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function SharePortfolioContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const getGitHubUsername = (user: User): string => {
    if ('github_username' in user) {
      return user.github_username || 'demo';
    }
    return 'demo';
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Generate portfolio URL based on GitHub username or user ID
      const baseUrl = window.location.origin;
      const username = getGitHubUsername(currentUser);
      setPortfolioUrl(`${baseUrl}/portfolio/${username}`);
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOnTwitter = () => {
    const text = `Check out my developer portfolio! ${portfolioUrl} #developer #portfolio #coding`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `${user?.name}'s Developer Portfolio`;
    const body = `Hi!\n\nI'd like to share my developer portfolio with you: ${portfolioUrl}\n\nIt includes my projects, skills, and AI-powered insights about my coding expertise.\n\nBest regards,\n${user?.name}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-slate-300">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-slate-300 hover:text-cyan-400 text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <Link href="/" className="text-lg sm:text-xl font-bold text-cyan-400">
                  PortReviewer
                </Link>
                <Badge variant="secondary" className="ml-2 bg-cyan-900/50 text-cyan-300 border-cyan-700/50 text-xs">
                  Share
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button className="bg-cyan-600 hover:bg-cyan-500 text-white transition-all hover:scale-105 text-sm sm:text-base" asChild>
                <Link href="/dashboard/developer">Dashboard</Link>
              </Button>
              <Avatar className="border-2 border-cyan-500/30 w-8 h-8 sm:w-10 sm:h-10">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-slate-800 text-cyan-400 text-sm">
                  {user.name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Share Your Portfolio
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Let others discover your skills and projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Portfolio Preview */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-400" />
                Portfolio Preview
              </CardTitle>
              <CardDescription className="text-slate-300">
                This is how your portfolio appears to visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="border-2 border-cyan-500/30">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="bg-slate-800 text-cyan-400">
                      {user.name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <p className="text-slate-400">@{getGitHubUsername(user)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Github className="w-4 h-4" />
                    <span>GitHub Profile</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <QrCode className="w-4 h-4" />
                    <span>AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Live Repository Data</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm sm:text-base" asChild>
                  <Link href={`/portfolio/${getGitHubUsername(user)}`} target="_blank">
                    <span className="hidden sm:inline">View Live Portfolio</span>
                    <span className="sm:hidden">View Portfolio</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sharing Options */}
          <div className="space-y-6">
            {/* Copy Link */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-green-400" />
                  Direct Link
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Copy your portfolio URL to share anywhere
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-md px-3 py-2">
                    <code className="text-cyan-400 text-sm break-all">{portfolioUrl}</code>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    className={`${copied ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-600 hover:bg-slate-500'} text-white transition-all`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Social Media
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Share on your favorite platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={shareOnTwitter}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Share on Twitter</span>
                  <span className="sm:hidden">Twitter</span>
                </Button>
                
                <Button
                  onClick={shareOnLinkedIn}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Share on LinkedIn</span>
                  <span className="sm:hidden">LinkedIn</span>
                </Button>
                
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Share via Email</span>
                  <span className="sm:hidden">Email</span>
                </Button>
              </CardContent>
            </Card>

            {/* Portfolio Stats */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-400" />
                  Portfolio Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                    <div className="text-lg font-bold text-green-400">Real-time</div>
                    <div className="text-xs text-slate-400">GitHub Data</div>
                  </div>
                  <div className="p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg">
                    <div className="text-lg font-bold text-purple-400">AI</div>
                    <div className="text-xs text-slate-400">Code Analysis</div>
                  </div>
                  <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">Mobile</div>
                    <div className="text-xs text-slate-400">Responsive</div>
                  </div>
                  <div className="p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg">
                    <div className="text-lg font-bold text-orange-400">Fast</div>
                    <div className="text-xs text-slate-400">Loading</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SharePortfolio() {
  return (
    <AuthGuard requiredUserType="developer">
      <SharePortfolioContent />
    </AuthGuard>
  );
}
