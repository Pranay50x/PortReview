'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function RecruiterDashboard() {
  const [user, setUser] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user data and candidates from API
    // This is mock data for now
    const mockUser = {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@techcorp.com',
      company: 'TechCorp',
      position: 'Senior Technical Recruiter',
      avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4'
    };

    const mockCandidates = [
      {
        id: '1',
        name: 'Alex Johnson',
        githubUsername: 'alexjohnson',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        title: 'Full-Stack Developer',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        experience: '5 years',
        codeQualityScore: 87,
        location: 'San Francisco, CA',
        lastActive: '2 days ago',
        matchScore: 95
      },
      {
        id: '2',
        name: 'Maria Garcia',
        githubUsername: 'mariagarcia',
        avatarUrl: 'https://avatars.githubusercontent.com/u/3?v=4',
        title: 'Frontend Engineer',
        skills: ['Vue.js', 'JavaScript', 'CSS', 'Figma'],
        experience: '3 years',
        codeQualityScore: 82,
        location: 'Austin, TX',
        lastActive: '1 day ago',
        matchScore: 88
      },
      {
        id: '3',
        name: 'David Kim',
        githubUsername: 'davidkim',
        avatarUrl: 'https://avatars.githubusercontent.com/u/4?v=4',
        title: 'Backend Engineer',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        experience: '4 years',
        codeQualityScore: 91,
        location: 'Seattle, WA',
        lastActive: '3 hours ago',
        matchScore: 92
      }
    ];

    setTimeout(() => {
      setUser(mockUser);
      setCandidates(mockCandidates);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                PortReviewer
              </Link>
              <Badge variant="secondary">Recruiter</Badge>
              <span className="text-sm text-gray-600">{user?.company}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/search">Advanced Search</Link>
              </Button>
              <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{user?.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 🎯
          </h1>
          <p className="text-gray-600 mt-2">
            Discover exceptional developers with AI-powered insights
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Candidates Reviewed</CardDescription>
              <CardTitle className="text-2xl text-blue-600">234</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">+28 this week</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Shortlisted</CardDescription>
              <CardTitle className="text-2xl text-green-600">47</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">+12 this week</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Interviews Scheduled</CardDescription>
              <CardTitle className="text-2xl text-purple-600">15</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">+5 this week</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Time Saved</CardDescription>
              <CardTitle className="text-2xl text-orange-600">45h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600">vs traditional screening</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Candidate Search */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Search</CardTitle>
                <CardDescription>
                  Find developers that match your requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search by name, skills, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    🔍 Advanced Filters
                  </Button>
                </div>

                {/* Candidate List */}
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                              <AvatarFallback>{candidate.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                <Badge 
                                  variant={candidate.matchScore >= 90 ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {candidate.matchScore}% Match
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{candidate.title}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span>📍 {candidate.location}</span>
                                <span>💼 {candidate.experience}</span>
                                <span>⭐ {candidate.codeQualityScore}/100 Code Quality</span>
                                <span>🕒 Active {candidate.lastActive}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/candidate/${candidate.id}`}>
                                View Profile
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Shortlisted Alex Johnson</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">👀</span>
                    <span>Viewed Maria Garcia's portfolio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">📅</span>
                    <span>Scheduled interview with David Kim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">🔍</span>
                    <span>Searched for React developers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/search/advanced">🔍 Advanced Search</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/shortlist">📋 View Shortlist</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/analytics">📊 Hiring Analytics</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/settings">⚙️ Preferences</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Trending Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['React', 'TypeScript', 'Node.js', 'Python', 'AWS'].map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm">{skill}</span>
                      <Badge variant="secondary" className="text-xs">
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
