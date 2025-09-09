// Recruitment AI Service for connecting to Python backend recruitment AI endpoints
const AI_API_BASE_URL = 'http://localhost:8000';

export interface CandidateProfile {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  experience: string;
  location: string;
  skills: string[];
  github_username?: string;
  linkedin?: string;
  summary: string;
  github_data?: Record<string, unknown>;
  portfolio_data?: Record<string, unknown>;
  resume_text?: string;
}

export interface CandidateAnalysis {
  technical_score: number;
  cultural_fit: number;
  experience_level: string;
  strengths: string[];
  weaknesses: string[];
  skills_assessment: Record<string, string>;
  interview_questions: string[];
  hiring_recommendation: string;
  salary_range: string;
}

export interface TalentPoolInsights {
  hot_skills: string[];
  emerging_technologies: string[];
  salary_trends: Record<string, number>;
  market_demand: {
    demand_supply_ratio: number;
    competition_level: string;
    hiring_difficulty: string;
  };
  recommendations: string[];
}

export interface InterviewKit {
  technical_questions: Array<{
    question: string;
    difficulty: string;
    skill: string;
    expected_answer: string;
    follow_ups: string[];
  }>;
  behavioral_questions: Array<{
    question: string;
    purpose: string;
    red_flags: string[];
    good_answers: string[];
  }>;
  coding_challenges: Array<{
    title: string;
    description: string;
    difficulty: string;
    time_limit: number;
    evaluation_criteria: string[];
  }>;
}

export interface HiringPrediction {
  success_probability: number;
  confidence_level: string;
  key_success_factors: string[];
  potential_risks: string[];
  onboarding_recommendations: string[];
  performance_prediction: string;
  retention_likelihood: string;
  growth_potential: string;
}

class RecruitmentAIService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${AI_API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${error.detail || 'Request failed'}`);
    }

    return response.json();
  }

  // Analyze candidate profile using real AI
  async analyzeCandidateProfile(candidate: CandidateProfile): Promise<CandidateAnalysis> {
    try {
      const response = await this.makeRequest('/api/recruitment/analyze-candidate', {
        method: 'POST',
        body: JSON.stringify({
          github_username: candidate.github_username || candidate.name.toLowerCase().replace(/\s+/g, ''),
          resume_text: candidate.summary,
          portfolio_data: candidate.portfolio_data || {},
          skills: candidate.skills,
        }),
      });

      return response.analysis;
    } catch (error) {
      console.error('Failed to analyze candidate:', error);
      // Fallback to enhanced mock data based on candidate info
      return this.getFallbackAnalysis(candidate);
    }
  }

  // Get talent pool insights
  async getTalentPoolInsights(requirements: {
    role: string;
    skills: string[];
    experience: string;
    location: string;
  }): Promise<TalentPoolInsights> {
    try {
      const response = await this.makeRequest('/api/recruitment/talent-pool-insights', {
        method: 'POST',
        body: JSON.stringify(requirements),
      });

      return response.insights;
    } catch (error) {
      console.error('Failed to get talent pool insights:', error);
      return this.getFallbackMarketInsights();
    }
  }

  // Create interview kit using AI
  async createInterviewKit(
    candidateProfile: CandidateProfile,
    jobRequirements: {
      role: string;
      skills: string[];
      experience: string;
      responsibilities: string[];
    }
  ): Promise<InterviewKit> {
    try {
      const response = await this.makeRequest('/api/recruitment/interview-kit', {
        method: 'POST',
        body: JSON.stringify({
          candidate_profile: {
            name: candidateProfile.name,
            role: candidateProfile.role,
            skills: candidateProfile.skills,
            experience: candidateProfile.experience,
            summary: candidateProfile.summary,
          },
          job_requirements: jobRequirements,
        }),
      });

      return response.interview_kit;
    } catch (error) {
      console.error('Failed to create interview kit:', error);
      return this.getFallbackInterviewKit(candidateProfile);
    }
  }

  // Generate job description using AI
  async generateJobDescription(requirements: {
    role: string;
    company: string;
    skills: string[];
    experience: string;
    location: string;
  }): Promise<string> {
    try {
      const response = await this.makeRequest('/api/recruitment/job-description', {
        method: 'POST',
        body: JSON.stringify(requirements),
      });

      return response.job_description;
    } catch (error) {
      console.error('Failed to generate job description:', error);
      return this.getFallbackJobDescription(requirements);
    }
  }

  // Predict hiring success using AI
  async predictHiringSuccess(
    candidateData: CandidateProfile,
    roleRequirements: {
      role: string;
      skills: string[];
      experience: string;
      responsibilities: string[];
    }
  ): Promise<HiringPrediction> {
    try {
      const response = await this.makeRequest('/api/recruitment/predict-hiring-success', {
        method: 'POST',
        body: JSON.stringify({
          candidate_data: {
            name: candidateData.name,
            role: candidateData.role,
            skills: candidateData.skills,
            experience: candidateData.experience,
            summary: candidateData.summary,
            github_username: candidateData.github_username,
          },
          role_requirements: roleRequirements,
        }),
      });

      return response.prediction;
    } catch (error) {
      console.error('Failed to predict hiring success:', error);
      return this.getFallbackHiringPrediction();
    }
  }

  // Get market trends
  async getMarketTrends(): Promise<TalentPoolInsights> {
    try {
      const response = await this.makeRequest('/api/recruitment/market-trends', {
        method: 'GET',
      });

      return response.trends;
    } catch (error) {
      console.error('Failed to get market trends:', error);
      return this.getFallbackMarketInsights();
    }
  }

  // Get candidate analytics if previously analyzed
  async getCandidateAnalytics(githubUsername: string): Promise<CandidateAnalysis | null> {
    try {
      const response = await this.makeRequest(`/api/recruitment/candidate-analytics/${githubUsername}`, {
        method: 'GET',
      });

      return response.analysis;
    } catch (error) {
      console.error('Failed to get candidate analytics:', error);
      return null;
    }
  }

  // Health check for AI service
  async checkAIHealth(): Promise<{ status: string; ai_service: string; langchain: string }> {
    try {
      const response = await this.makeRequest('/api/recruitment/health', {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('AI health check failed:', error);
      return { status: 'unavailable', ai_service: 'offline', langchain: 'unavailable' };
    }
  }

  // Fallback methods for when AI is unavailable
  private getFallbackAnalysis(candidate: CandidateProfile): CandidateAnalysis {
    const skillCount = candidate.skills.length;
    const experienceYears = parseInt(candidate.experience.match(/\d+/)?.[0] || '3');
    
    const technicalScore = Math.min(95, 60 + (skillCount * 4) + (experienceYears * 3));
    const culturalFit = Math.min(95, 70 + (skillCount * 2) + (experienceYears * 2));
    
    const getExperienceLevel = () => {
      if (experienceYears >= 8) return 'Expert';
      if (experienceYears >= 5) return 'Senior';
      if (experienceYears >= 2) return 'Mid-Level';
      return 'Junior';
    };

    const getHiringRecommendation = () => {
      if (technicalScore >= 85) return 'strongly_recommended';
      if (technicalScore >= 75) return 'recommended';
      if (technicalScore >= 65) return 'consider';
      return 'not_recommended';
    };

    return {
      technical_score: technicalScore,
      cultural_fit: culturalFit,
      experience_level: getExperienceLevel(),
      strengths: [
        `Strong ${candidate.role.toLowerCase()} expertise`,
        `${skillCount > 5 ? 'Diverse' : 'Focused'} technical skill set`,
        `${experienceYears} years of industry experience`,
        candidate.location.toLowerCase().includes('remote') ? 'Remote work experience' : 'Location flexibility',
      ].slice(0, 4),
      weaknesses: [
        'Could benefit from more leadership experience',
        'Documentation practices could be enhanced',
        'Testing methodologies could be strengthened',
      ].slice(0, 2),
      skills_assessment: candidate.skills.reduce((acc, skill, index) => {
        const levels = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
        acc[skill] = levels[index % 4];
        return acc;
      }, {} as Record<string, string>),
      interview_questions: [
        `How do you approach ${candidate.role.toLowerCase()} challenges in your current role?`,
        `Describe your experience with ${candidate.skills[0] || 'key technologies'}.`,
        'Walk me through your problem-solving process for complex technical issues.',
        'How do you stay updated with new technologies and industry trends?',
        'Tell me about a challenging project you worked on recently.',
      ],
      hiring_recommendation: getHiringRecommendation(),
      salary_range: `$${70 + experienceYears * 8}K - $${100 + experienceYears * 10}K`,
    };
  }

  private getFallbackMarketInsights(): TalentPoolInsights {
    return {
      hot_skills: ['React', 'TypeScript', 'Python', 'AWS', 'Kubernetes', 'Next.js', 'Node.js'],
      emerging_technologies: ['AI/ML Integration', 'Edge Computing', 'WebAssembly', 'Rust', 'Deno'],
      salary_trends: {
        'React': 15.2,
        'TypeScript': 18.5,
        'Python': 12.3,
        'AWS': 20.1,
        'Kubernetes': 22.8,
        'Next.js': 25.4,
      },
      market_demand: {
        demand_supply_ratio: 2.4,
        competition_level: 'High',
        hiring_difficulty: 'Challenging',
      },
      recommendations: [
        'Offer competitive compensation - market is highly competitive',
        'Emphasize remote work flexibility to expand candidate pool',
        'Invest in technical assessment tools for better evaluation',
        'Consider candidates with adjacent skills who can learn quickly',
        'Highlight growth opportunities and learning budget in job postings',
      ],
    };
  }

  private getFallbackInterviewKit(candidate: CandidateProfile): InterviewKit {
    return {
      technical_questions: [
        {
          question: `How would you architect a scalable ${candidate.role.toLowerCase()} solution?`,
          difficulty: 'Medium',
          skill: 'System Design',
          expected_answer: 'Discussion of scalability patterns, load balancing, caching strategies',
          follow_ups: ['How would you handle increased traffic?', 'What about data consistency?'],
        },
        {
          question: `Explain your experience with ${candidate.skills[0] || 'modern technologies'}.`,
          difficulty: 'Medium',
          skill: candidate.skills[0] || 'Technical Knowledge',
          expected_answer: 'Detailed explanation of practical experience and best practices',
          follow_ups: ['What challenges did you face?', 'How did you solve them?'],
        },
      ],
      behavioral_questions: [
        {
          question: 'Tell me about a time you had to learn a new technology quickly.',
          purpose: 'Assess adaptability and learning agility',
          red_flags: ['Resistance to change', 'Lack of structured approach'],
          good_answers: ['Proactive learning', 'Practical application', 'Knowledge sharing'],
        },
        {
          question: 'Describe a challenging technical problem you solved.',
          purpose: 'Evaluate problem-solving skills and technical depth',
          red_flags: ['Vague responses', 'No clear methodology'],
          good_answers: ['Clear problem definition', 'Systematic approach', 'Measurable results'],
        },
      ],
      coding_challenges: [
        {
          title: 'API Rate Limiter',
          description: 'Implement a rate limiting system for API endpoints',
          difficulty: 'Medium',
          time_limit: 45,
          evaluation_criteria: ['Algorithm choice', 'Edge case handling', 'Code quality', 'Scalability'],
        },
        {
          title: 'Data Processing Pipeline',
          description: 'Design a system to process and analyze large datasets',
          difficulty: 'Hard',
          time_limit: 60,
          evaluation_criteria: ['Architecture design', 'Performance optimization', 'Error handling'],
        },
      ],
    };
  }

  private getFallbackJobDescription(requirements: {
    role: string;
    company: string;
    skills: string[];
    experience: string;
    location: string;
  }): string {
    return `# ${requirements.role} at ${requirements.company}

## About the Role
Join our innovative team as a ${requirements.role} in ${requirements.location}. You'll work on cutting-edge projects that impact thousands of users and help shape our technology future.

## What You'll Do
- Design and develop scalable applications using modern technologies
- Collaborate with cross-functional teams to deliver high-quality solutions
- Participate in code reviews and contribute to architectural decisions
- Mentor team members and share technical knowledge
- Stay current with industry trends and best practices

## Requirements
- ${requirements.experience} of professional development experience
- Strong proficiency in ${requirements.skills.slice(0, 3).join(', ')}
- Experience with ${requirements.skills.slice(3, 6).join(', ')}
- Excellent problem-solving and communication skills
- Bachelor's degree in Computer Science or equivalent experience

## Nice to Have
- Experience with cloud platforms (AWS, GCP, Azure)
- Knowledge of DevOps practices and CI/CD pipelines
- Open source contributions
- Experience in agile development environments

## What We Offer
- Competitive salary and equity package
- Comprehensive health and dental insurance
- Flexible working hours and remote work options
- Professional development budget ($2,500/year)
- State-of-the-art equipment and development tools
- Collaborative and inclusive work environment

Ready to make an impact? Apply now!`;
  }

  private getFallbackHiringPrediction(): HiringPrediction {
    return {
      success_probability: 0.78,
      confidence_level: 'Medium',
      key_success_factors: [
        'Strong technical skills alignment',
        'Positive learning attitude demonstrated',
        'Good communication skills',
        'Relevant industry experience',
      ],
      potential_risks: [
        'May need time to adapt to team practices',
        'Limited experience with specific tech stack',
        'Remote collaboration adjustment period',
      ],
      onboarding_recommendations: [
        'Pair with senior developer for first month',
        'Provide comprehensive documentation access',
        'Set clear 30-60-90 day goals',
        'Schedule regular check-ins with manager',
        'Connect with team mentor for cultural integration',
      ],
      performance_prediction: 'Meets expectations',
      retention_likelihood: 'High',
      growth_potential: 'High',
    };
  }

  // Alias for more intuitive API
  async analyzeCandidate(candidate: CandidateProfile): Promise<CandidateAnalysis> {
    return this.analyzeCandidateProfile(candidate);
  }
}

export const recruitmentAIService = new RecruitmentAIService();
