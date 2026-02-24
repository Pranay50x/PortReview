// AI Candidate Analysis Panel Component
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Star, 
  Code, 
  Users, 
  Award,
  MessageSquare,
  FileText,
  Target,
  Sparkles
} from 'lucide-react';
import { recruitmentAI, type CandidateAnalysis } from '@/lib/ai-agents';

interface CandidateAnalysisPanelProps {
  candidate: {
    id: string;
    name: string;
    githubUsername: string;
    avatarUrl: string;
    title: string;
    skills: string[];
    experience: string;
    codeQualityScore: number;
    location: string;
    matchScore: number;
  };
  onClose: () => void;
}

export default function CandidateAnalysisPanel({ candidate, onClose }: CandidateAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<CandidateAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await recruitmentAI.analyzeCandidateProfile({
        githubUsername: candidate.githubUsername,
        resumeText: 'Mock resume content for analysis',
        portfolioUrl: `https://github.com/${candidate.githubUsername}`
      });
      setAnalysis(result);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/90 backdrop-blur-sm border-emerald-500/30 shadow-2xl">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
              <AvatarFallback className="bg-slate-700 text-emerald-400">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                AI Analysis: {candidate.name}
              </CardTitle>
              <CardDescription className="text-slate-300">
                Deep candidate intelligence powered by AI
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!analysisComplete && (
          <div className="text-center py-8">
            {loading ? (
              <div className="space-y-4">
                <Brain className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <div className="text-slate-300">Running comprehensive AI analysis...</div>
                <div className="text-sm text-slate-400">Analyzing code quality, project complexity, and cultural fit</div>
              </div>
            ) : (
              <div className="space-y-4">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
                <div className="text-slate-300">Ready to analyze {candidate.name}</div>
                <Button 
                  onClick={runAnalysis}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Start AI Analysis
                </Button>
              </div>
            )}
          </div>
        )}

        {analysis && analysisComplete && (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-700/30 border-slate-600/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{analysis.technicalScore}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Code className="w-3 h-3" />
                    Technical Score
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/30 border-slate-600/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{analysis.culturalFit}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    Cultural Fit
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/30 border-slate-600/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{analysis.experienceLevel}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Award className="w-3 h-3" />
                    Experience
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Areas for Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Key Strengths
                </h4>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Star className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  Areas for Growth
                </h4>
                <div className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interview Questions */}
            <div>
              <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Recommended Interview Questions
              </h4>
              <div className="space-y-2">
                {analysis.interviewQuestions.slice(0, 3).map((question, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-300">{question}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Assessment */}
            <div>
              <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Skills Assessment
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(analysis.skillsAssessment).map(([skill, level]) => (
                  <div key={skill} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-sm text-slate-300">{skill}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        level === 'Expert' ? 'border-green-500 text-green-400' :
                        level === 'Advanced' ? 'border-blue-500 text-blue-400' :
                        level === 'Intermediate' ? 'border-yellow-500 text-yellow-400' :
                        'border-slate-500 text-slate-400'
                      }`}
                    >
                      {level}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Shortlist Candidate
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
