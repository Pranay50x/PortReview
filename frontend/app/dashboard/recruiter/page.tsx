'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Target, Star, Search, Filter, ClipboardList, BarChart3, LogOut } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentUser, signOut, type User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function RecruiterDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Generate mock candidates (no more hardcoded Alex/Sarah)
      const mockCandidates = [
        {
          id: '1',
          name: 'Jordan Smith',
          githubUsername: 'jordansmith',
          avatarUrl: 'https://avatars.githubusercontent.com/u/101?v=4',
          title: 'Full-Stack Developer',
          skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
          experience: '4 years',
          codeQualityScore: 89,
          location: 'Austin, TX',
          lastActive: '1 day ago',
          matchScore: 92
        },
        {
          id: '2',
          name: 'Casey Johnson',
          githubUsername: 'caseyjohnson',
          avatarUrl: 'https://avatars.githubusercontent.com/u/102?v=4',
          title: 'Frontend Engineer',
          skills: ['Vue.js', 'JavaScript', 'CSS', 'Figma'],
          experience: '3 years',
          codeQualityScore: 85,
          location: 'Seattle, WA',
          lastActive: '2 hours ago',
          matchScore: 87
        },
        {
          id: '3',
          name: 'Riley Chen',
          githubUsername: 'rileychen',
          avatarUrl: 'https://avatars.githubusercontent.com/u/103?v=4',
          title: 'Backend Engineer',
          skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
          experience: '5 years',
          codeQualityScore: 91,
          location: 'New York, NY',
          lastActive: '3 days ago',
          matchScore: 94
        }
      ];

      setTimeout(() => {
        setCandidates(mockCandidates);
        setLoading(false);
      }, 1000);
    }
  }, []);

  const handleSignOut = () => {
    signOut();
    router.push('/auth/login');
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-slate-300">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-teal-400">
                PortReviewer
              </Link>
              <Badge variant="secondary" className="bg-teal-900/50 text-teal-300 border-teal-700/50">
                Recruiter
              </Badge>
              <span className="text-sm text-slate-400">{user?.company}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-300 hover:text-teal-400" asChild>
                <Link href="/search">Advanced Search</Link>
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-slate-300 hover:text-red-400 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
              <Avatar className="border-2 border-teal-500/30">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-slate-800 text-teal-400">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0]}!
            <Target className="w-8 h-8 text-emerald-400" />
          </h1>
          <p className="text-slate-300 mt-2">
            Discover exceptional developers with AI-powered insights
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Candidates Reviewed</CardDescription>
              <CardTitle className="text-2xl text-blue-400">234</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">+28 this week</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Shortlisted</CardDescription>
              <CardTitle className="text-2xl text-green-400">47</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">+12 this week</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Interviews Scheduled</CardDescription>
              <CardTitle className="text-2xl text-purple-400">15</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">+5 this week</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Time Saved</CardDescription>
              <CardTitle className="text-2xl text-orange-400">45h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-400">vs traditional screening</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Candidate Search */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Candidate Search</CardTitle>
                <CardDescription className="text-slate-300">
                  Find developers that match your requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search by name, skills, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Button variant="outline" className="flex items-center gap-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                  </Button>
                </div>

                {/* Candidate List */}
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12 border-2 border-slate-600">
                              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                              <AvatarFallback className="bg-slate-800 text-slate-300">
                                {candidate.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-white">{candidate.name}</h3>
                                <Badge 
                                  variant={candidate.matchScore >= 90 ? "default" : "secondary"}
                                  className={`text-xs ${
                                    candidate.matchScore >= 90 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-slate-600 text-slate-300 border-slate-500'
                                  }`}
                                >
                                  {candidate.matchScore}% Match
                                </Badge>
                              </div>
                              <p className="text-slate-300 mb-2">{candidate.title}</p>
                              <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {candidate.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Search className="w-3 h-3" />
                                  {candidate.experience}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {candidate.codeQualityScore}/100 Code Quality
                                </span>
                                <span className="flex items-center gap-1">
                                  <ClipboardList className="w-3 h-3" />
                                  Active {candidate.lastActive}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs border-slate-500 text-slate-300">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white" asChild>
                              <Link href={`/candidate/${candidate.id}`}>
                                View Profile
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                              Shortlist
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-green-400">✓</span>
                    <span>Shortlisted Jordan Smith</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-blue-400">👀</span>
                    <span>Viewed Casey Johnson's portfolio</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-purple-400">📅</span>
                    <span>Scheduled interview with Riley Chen</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Search className="w-4 h-4 text-orange-400" />
                    <span>Searched for React developers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white" variant="outline" asChild>
                  <Link href="/search/advanced" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Advanced Search
                  </Link>
                </Button>
                <Button className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" variant="outline" asChild>
                  <Link href="/shortlist" className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    View Shortlist
                  </Link>
                </Button>
                <Button className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" variant="outline" asChild>
                  <Link href="/analytics" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Hiring Analytics
                  </Link>
                </Button>
                <Button 
                  className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" 
                  variant="outline" 
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Trending Skills */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Trending Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['React', 'TypeScript', 'Node.js', 'Python', 'AWS'].map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{skill}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300 border-slate-500">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RecruiterDashboard() {
  return (
    <AuthGuard requiredUserType="recruiter">
      <RecruiterDashboardContent />
    </AuthGuard>
  );
}
