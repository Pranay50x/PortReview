// AI Interview Kit Generator Component
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Brain, 
  Code, 
  Users, 
  Timer,
  CheckCircle,
  Star,
  ArrowRight,
  FileText,
  Download,
  RefreshCw,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { recruitmentAI, type InterviewKit } from '@/lib/ai-agents';

interface InterviewKitGeneratorProps {
  candidate?: {
    id: string;
    name: string;
    avatarUrl: string;
    title: string;
    skills: string[];
    experience: string;
  };
  onClose?: () => void;
}

export default function InterviewKitGenerator({ candidate, onClose }: InterviewKitGeneratorProps) {
  const [kit, setKit] = useState<InterviewKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'technical' | 'behavioral' | 'coding'>('technical');
  const [customRole, setCustomRole] = useState('');
  const [customSkills, setCustomSkills] = useState('');

  const generateKit = async () => {
    setLoading(true);
    try {
      const candidateProfile = candidate ? {
        name: candidate.name,
        skills: candidate.skills,
        experience: candidate.experience,
        title: candidate.title
      } : {
        name: 'Generic Candidate',
        skills: customSkills.split(',').map(s => s.trim()),
        experience: 'Mid-level',
        title: customRole
      };

      const jobRequirements = {
        role: candidate?.title || customRole,
        skills: candidate?.skills || customSkills.split(',').map(s => s.trim()),
        level: candidate?.experience || 'Mid-level'
      };

      const generatedKit = await recruitmentAI.createInterviewKit(candidateProfile, jobRequirements);
      setKit(generatedKit);
    } catch (error) {
      console.error('Failed to generate interview kit:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadKit = () => {
    if (!kit) return;
    
    const content = `
# Interview Kit - ${candidate?.name || customRole}

## Technical Questions
${kit.technicalQuestions.map((q, i) => `
${i + 1}. **${q.question}** (${q.difficulty})
   - Skill: ${q.skill}
   - Expected Answer: ${q.expectedAnswer}
   - Follow-ups: ${q.followUps.join(', ')}
`).join('')}

## Behavioral Questions
${kit.behavioralQuestions.map((q, i) => `
${i + 1}. ${q}
`).join('')}

## Coding Challenges
${kit.codingChallenges.map((c, i) => `
${i + 1}. **${c.title}** (${c.difficulty})
   - Description: ${c.description}
   - Time Limit: ${c.timeLimit} minutes
   - Evaluation: ${c.evaluationCriteria.join(', ')}
`).join('')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interview_Kit_${candidate?.name?.replace(/\s+/g, '_') || 'Custom'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {candidate && (
                <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
                  <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                  <AvatarFallback className="bg-slate-700 text-emerald-400">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  AI Interview Kit Generator
                  {candidate && <span className="text-emerald-400">• {candidate.name}</span>}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {candidate 
                    ? `Customized interview questions for ${candidate.title}`
                    : 'Create custom interview questions for any role'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {kit && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={downloadKit}
                  className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Kit
                </Button>
              )}
              {onClose && (
                <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                  ✕
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!candidate && !kit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="role" className="text-slate-300">Job Role</Label>
                <Input
                  id="role"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="skills" className="text-slate-300">Required Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {!kit && (
            <div className="text-center py-12">
              {loading ? (
                <div className="space-y-4">
                  <Brain className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
                  <div className="text-slate-300">Generating customized interview questions...</div>
                  <div className="text-sm text-slate-400">This may take a few moments</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <MessageSquare className="w-12 h-12 text-green-400 mx-auto" />
                  <div className="text-slate-300">
                    {candidate 
                      ? `Ready to generate interview kit for ${candidate.name}`
                      : 'Ready to generate custom interview kit'
                    }
                  </div>
                  <Button 
                    onClick={generateKit}
                    disabled={!candidate && (!customRole || !customSkills)}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Interview Kit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {kit && (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 bg-slate-700/30 p-1 rounded-lg">
                <Button
                  variant={activeTab === 'technical' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('technical')}
                  className={activeTab === 'technical' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Technical ({kit.technicalQuestions.length})
                </Button>
                <Button
                  variant={activeTab === 'behavioral' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('behavioral')}
                  className={activeTab === 'behavioral' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white'}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Behavioral ({kit.behavioralQuestions.length})
                </Button>
                <Button
                  variant={activeTab === 'coding' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('coding')}
                  className={activeTab === 'coding' ? 'bg-green-600 text-white' : 'text-slate-300 hover:text-white'}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Coding Challenges ({kit.codingChallenges.length})
                </Button>
              </div>

              {/* Technical Questions */}
              {activeTab === 'technical' && (
                <div className="space-y-4">
                  <h3 className="text-slate-300 font-medium flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    Technical Questions
                  </h3>
                  {kit.technicalQuestions.map((question, index) => (
                    <Card key={index} className="bg-slate-700/30 border-slate-600/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="text-slate-200 font-medium pr-4">{question.question}</h4>
                            <div className="flex gap-2 flex-shrink-0">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  question.difficulty === 'hard' ? 'border-red-500 text-red-400' :
                                  question.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                  'border-green-500 text-green-400'
                                }`}
                              >
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                                {question.skill}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm text-slate-400">Expected Answer:</div>
                                <div className="text-sm text-slate-300">{question.expectedAnswer}</div>
                              </div>
                            </div>
                            
                            {question.followUps.length > 0 && (
                              <div className="flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm text-slate-400">Follow-up Questions:</div>
                                  <ul className="text-sm text-slate-300 space-y-1">
                                    {question.followUps.map((followUp, i) => (
                                      <li key={i}>• {followUp}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Behavioral Questions */}
              {activeTab === 'behavioral' && (
                <div className="space-y-4">
                  <h3 className="text-slate-300 font-medium flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Behavioral Questions
                  </h3>
                  <div className="grid gap-3">
                    {kit.behavioralQuestions.map((questionObj, index) => (
                      <Card key={index} className="bg-slate-700/30 border-slate-600/50">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="bg-green-600/20 p-2 rounded-lg">
                                <span className="text-green-400 font-medium text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <div className="text-slate-200 font-medium">{questionObj.question}</div>
                                <div className="text-sm text-slate-400 mt-1">{questionObj.purpose}</div>
                              </div>
                            </div>
                            
                            <div className="ml-12 space-y-2">
                              <div>
                                <div className="text-sm text-green-400 font-medium">Good Answers Include:</div>
                                <ul className="text-sm text-slate-300 space-y-1">
                                  {questionObj.goodAnswers.map((answer, i) => (
                                    <li key={i}>• {answer}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <div className="text-sm text-red-400 font-medium">Red Flags:</div>
                                <ul className="text-sm text-slate-300 space-y-1">
                                  {questionObj.redFlags.map((flag, i) => (
                                    <li key={i}>• {flag}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Coding Challenges */}
              {activeTab === 'coding' && (
                <div className="space-y-4">
                  <h3 className="text-slate-300 font-medium flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Coding Challenges
                  </h3>
                  {kit.codingChallenges.map((challenge, index) => (
                    <Card key={index} className="bg-slate-700/30 border-slate-600/50">
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-slate-200 font-medium text-lg">{challenge.title}</h4>
                              <p className="text-slate-300 mt-2">{challenge.description}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  challenge.difficulty.includes('Hard') ? 'border-red-500 text-red-400' :
                                  challenge.difficulty.includes('Medium') ? 'border-yellow-500 text-yellow-400' :
                                  'border-green-500 text-green-400'
                                }`}
                              >
                                {challenge.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-400 flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {challenge.timeLimit}m
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-slate-400 mb-2">Evaluation Criteria:</div>
                            <div className="flex flex-wrap gap-2">
                              {challenge.evaluationCriteria.map((criteria, i) => (
                                <Badge key={i} variant="outline" className="text-xs border-green-500 text-green-400">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {criteria}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <Button 
                  onClick={generateKit}
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button 
                  onClick={downloadKit}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Complete Kit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
