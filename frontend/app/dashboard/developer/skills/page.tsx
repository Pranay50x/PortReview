'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Code, 
  TrendingUp, 
  Target,
  Star,
  Github,
  Calendar,
  CheckCircle2,
  Clock,
  Trophy,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AuthGuard from '@/components/AuthGuard';
import { getCurrentUser } from '@/lib/auth';

interface SkillData {
  language: string;
  count: number;
  percentage: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  projects: number;
}

function SkillTrackerContent() {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    loadSkillsData();
  }, []);

  const loadSkillsData = async () => {
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser?.github_username) {
        setLoading(false);
        return;
      }

      // Use the analyze endpoint which has real GitHub data
      const response = await fetch(`http://localhost:8000/api/github/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser.github_username
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub data');
      }
      
      const data = await response.json();
      setTotalProjects(data.repositories_count || 0);
      
      // Transform technical skills from AI insights to skill data
      const technicalSkills = data.ai_insights?.technical_skills || {};
      const languageSkills = Object.entries(technicalSkills).map(([language, proficiency], index) => {
        const percentage = Math.round((proficiency as number) * 100);
        
        let level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' = 'Beginner';
        if (percentage >= 80) level = 'Expert';
        else if (percentage >= 65) level = 'Advanced';
        else if (percentage >= 40) level = 'Intermediate';
        
        // Estimate project count based on proficiency and total repos
        const projectCount = Math.max(1, Math.round((proficiency as number) * data.repositories_count * 0.6));
        
        return {
          language,
          count: projectCount,
          percentage,
          level,
          projects: projectCount
        };
      });

      setSkills(languageSkills);
    } catch (error) {
      console.error('Failed to load skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Advanced': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-400" />
              Skill Tracker
            </h1>
            <p className="text-slate-400 text-lg">
              Track your technical skills and development progress based on your GitHub activity
            </p>
          </motion.div>

          {/* Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100/80 text-sm font-medium mb-1">Skills Tracked</p>
                    <p className="text-white text-3xl font-bold">{skills.length}</p>
                  </div>
                  <Code className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100/80 text-sm font-medium mb-1">Expert Level</p>
                    <p className="text-white text-3xl font-bold">
                      {skills.filter(s => s.level === 'Expert').length}
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100/80 text-sm font-medium mb-1">Total Projects</p>
                    <p className="text-white text-3xl font-bold">{totalProjects}</p>
                  </div>
                  <Github className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Programming Languages & Technologies
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Based on your GitHub repository analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <div className="space-y-6">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill.language}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-6 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <Code className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-lg">{skill.language}</h3>
                              <p className="text-slate-400 text-sm">
                                Used in {skill.projects} project{skill.projects !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <Badge className={getSkillLevelColor(skill.level)}>
                            {skill.level}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300 text-sm">Proficiency</span>
                            <span className="text-white font-medium">{skill.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-600/50 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.percentage}%` }}
                              transition={{ delay: 0.2 * index, duration: 0.8 }}
                              className={`h-full ${getProgressColor(skill.percentage)} rounded-full`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Code className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-semibold mb-2">No Skills Data Available</h3>
                    <p className="text-slate-400 mb-6">
                      Make sure you have public repositories with code to track your skills.
                    </p>
                    <Button
                      onClick={() => window.open('https://github.com', '_blank')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Go to GitHub
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations */}
          {skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Skill Development Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
                      <h4 className="text-white font-medium mb-1">Strengthen Your Expertise</h4>
                      <p className="text-slate-400 text-sm">
                        Focus on your top skills: {skills.slice(0, 2).map(s => s.language).join(', ')}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-400 mb-2" />
                      <h4 className="text-white font-medium mb-1">Diversify Your Stack</h4>
                      <p className="text-slate-400 text-sm">
                        Consider learning complementary technologies to broaden your expertise
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SkillTracker() {
  return (
    <AuthGuard requiredUserType="developer">
      <SkillTrackerContent />
    </AuthGuard>
  );
}
