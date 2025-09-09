'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  Search, 
  Filter, 
  Users, 
  BarChart3, 
  LogOut,
  Brain,
  TrendingUp,
  Calendar,
  MessageSquare,
  Zap,
  Eye,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
  FileText,
  Settings,
  Bell,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentUser, signOut, type User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function RecruiterDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadInitialData();
    }
  }, []);

  const loadInitialData = async () => {
    // Generate enhanced mock candidates with more data
    const mockCandidates = [
      {
        id: '1',
        name: 'Sarah Chen',
        email: 'sarah.chen@email.com',
        role: 'Senior Frontend Developer',
        experience: '5+ years',
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
        location: 'San Francisco, CA',
        status: 'Under Review',
        matchScore: 92,
        githubUrl: 'https://github.com/sarahchen',
        portfolioUrl: 'https://sarahchen.dev',
        salary: '$120,000 - $140,000'
      },
      {
        id: '2',
        name: 'Alex Kumar',
        email: 'alex.kumar@email.com',
        role: 'Full Stack Engineer',
        experience: '3+ years',
        skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
        location: 'New York, NY',
        status: 'Interview Scheduled',
        matchScore: 87,
        githubUrl: 'https://github.com/alexkumar',
        portfolioUrl: 'https://alexkumar.dev',
        salary: '$95,000 - $115,000'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        role: 'Backend Developer',
        experience: '4+ years',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'AWS'],
        location: 'Austin, TX',
        status: 'Offer Extended',
        matchScore: 89,
        githubUrl: 'https://github.com/emilyrodriguez',
        portfolioUrl: 'https://emilyrodriguez.dev',
        salary: '$105,000 - $125,000'
      }
    ];

    setCandidates(mockCandidates);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">PortReviewer</h1>
              <Badge className="ml-3 bg-emerald-600">Recruiter</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={
                      user?.avatar_url || 
                      (user?.user_type === 'recruiter' && (user as any)?.google_profile?.picture) || 
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                    } 
                  />
                  <AvatarFallback>{user?.name?.[0] || 'R'}</AvatarFallback>
                </Avatar>
                <span className="text-white text-sm">{user?.name || 'Recruiter'}</span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'overview' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Target className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'candidates' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Candidates
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'insights' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Brain className="w-4 h-4" />
              Insights
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'analytics' ? 'bg-yellow-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            {/* <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'tools' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              AI Tools
            </button> */}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Enhanced Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Active Candidates
                    </CardDescription>
                    <CardTitle className="text-2xl text-blue-400">342</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-blue-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +12% this week
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Interviews Scheduled
                    </CardDescription>
                    <CardTitle className="text-2xl text-green-400">28</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-green-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next: 2:00 PM today
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-slate-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Offers Extended
                    </CardDescription>
                    <CardTitle className="text-2xl text-yellow-400">15</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-yellow-400 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      87% acceptance rate
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-slate-400 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Profiles Analyzed
                    </CardDescription>
                    <CardTitle className="text-2xl text-emerald-400">1,247</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +34% this month
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lower Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Tools Grid - Redesigned */}
                <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    AI-Powered Tools
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Intelligent recruitment solutions at your fingertips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/ai-tools/job-description" className="group">
                      <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg p-4 hover:border-emerald-500/40 transition-all hover:scale-105">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-medium text-sm mb-1">Job Description</h3>
                        <p className="text-slate-400 text-xs">AI-generated JDs</p>
                      </div>
                    </Link>
                    
                    <Link href="/ai-tools/interview-kit" className="group">
                      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 hover:border-blue-500/40 transition-all hover:scale-105">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-medium text-sm mb-1">Interview Kit</h3>
                        <p className="text-slate-400 text-xs">Smart questions</p>
                      </div>
                    </Link>
                    
                    <Link href="/ai-tools/candidate-analysis" className="group">
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-all hover:scale-105">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-3">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-medium text-sm mb-1">AI Analysis</h3>
                        <p className="text-slate-400 text-xs">Candidate insights</p>
                      </div>
                    </Link>
                    
                    <Link href="/ai-tools/market-analysis" className="group">
                      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 hover:border-green-500/40 transition-all hover:scale-105">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-3">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-medium text-sm mb-1">Market Intel</h3>
                        <p className="text-slate-400 text-xs">Salary insights</p>
                      </div>
                    </Link>
                    
                    <Link href="/ai-tools/hiring-prediction" className="group">
                      <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-lg p-4 hover:border-pink-500/40 transition-all hover:scale-105">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg flex items-center justify-center mb-3">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-medium text-sm mb-1">Hiring Prediction</h3>
                        <p className="text-slate-400 text-xs">Success analysis</p>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <Link href="/ai-tools">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Explore All AI Tools
                        <ArrowUpRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg border border-blue-600/20">
                      <div>
                        <p className="text-white font-medium">Technical Interview</p>
                        <p className="text-slate-400 text-sm">Sarah Chen - Frontend Developer</p>
                      </div>
                      <Badge className="bg-blue-600">2:00 PM</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                      <div>
                        <p className="text-white font-medium">Final Round</p>
                        <p className="text-slate-400 text-sm">Alex Kumar - Full Stack</p>
                      </div>
                      <Badge className="bg-green-600">4:30 PM</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                      <div>
                        <p className="text-white font-medium">Team Review</p>
                        <p className="text-slate-400 text-sm">Weekly candidate discussion</p>
                      </div>
                      <Badge className="bg-green-600">6:00 PM</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Candidates Tab */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search candidates by name, role, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Candidates Grid */}
              <div className="grid gap-6">
                {filteredCandidates.map((candidate) => (
                  <Card key={candidate.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.email}`} />
                              <AvatarFallback className="bg-green-600 text-white">
                                {candidate.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
                              <p className="text-slate-300">{candidate.role}</p>
                              <p className="text-slate-400 text-sm">{candidate.email}</p>
                            </div>
                            <Badge 
                              className={`ml-auto ${
                                candidate.status === 'Under Review' ? 'bg-yellow-600' :
                                candidate.status === 'Interview Scheduled' ? 'bg-blue-600' :
                                candidate.status === 'Offer Extended' ? 'bg-green-600' : 'bg-gray-600'
                              }`}
                            >
                              {candidate.status}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                <Clock className="w-4 h-4" />
                                Experience: {candidate.experience}
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                <MapPin className="w-4 h-4" />
                                {candidate.location}
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Star className="w-4 h-4" />
                                Match Score: {candidate.matchScore}%
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm mb-2">Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.slice(0, 5).map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs border-slate-500 text-slate-300">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 5 && (
                                  <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                                    +{candidate.skills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-emerald-400 font-medium mt-2">
                                Expected: {candidate.salary}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/ai-tools/candidate-analysis?candidate=${candidate.id}`}>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              <Brain className="w-4 h-4 mr-2" />
                              AI Analysis
                            </Button>
                          </Link>
                          <Link href={`/ai-tools/interview-kit?candidate=${candidate.id}`}>
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-500 text-white"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Interview Kit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-400" />
                    AI Market Insights
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Real-time intelligence on talent market trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">Hot Skills in Demand</h4>
                      <div className="space-y-2">
                        {['TypeScript', 'React', 'Python', 'AWS', 'Docker'].map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-600/10 rounded border border-green-600/20">
                            <span className="text-green-300">{skill}</span>
                            <Badge className="bg-green-600">+{25 + index * 5}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-3">Salary Trends</h4>
                      <div className="space-y-2">
                        {[
                          { role: 'Senior Frontend', range: '$110k - $140k' },
                          { role: 'Full Stack Engineer', range: '$100k - $130k' },
                          { role: 'Backend Developer', range: '$95k - $125k' },
                          { role: 'DevOps Engineer', range: '$105k - $135k' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-blue-600/10 rounded border border-blue-600/20">
                            <span className="text-blue-300">{item.role}</span>
                            <span className="text-blue-200 text-sm">{item.range}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                    Recruitment Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">85%</div>
                      <div className="text-slate-300">Offer Acceptance Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">12</div>
                      <div className="text-slate-300">Average Days to Hire</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">94%</div>
                      <div className="text-slate-300">Candidate Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    AI-Powered Tools
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Advanced recruitment intelligence and automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/ai-tools/job-description">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Job Description
                    </Button>
                  </Link>
                  <Link href="/ai-tools/interview-kit">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white justify-start"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Create Interview Questions
                    </Button>
                  </Link>
                  <Link href="/ai-tools/candidate-analysis">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white justify-start">
                      <Brain className="w-4 h-4 mr-2" />
                      AI Candidate Analysis
                    </Button>
                  </Link>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Talent Market Intelligence
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Hiring Prediction Model
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
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
