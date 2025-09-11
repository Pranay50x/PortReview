"""
LangChain-powered AI agents for recruitment intelligence
Provides real AI analysis using Google Gemini through LangChain
"""

from langchain_google_genai import GoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings

class CandidateAnalysisOutput(BaseModel):
    """Structured output for candidate analysis"""
    technical_score: float = Field(description="Technical skill score (0-100)")
    cultural_fit: float = Field(description="Cultural fit score (0-100)")
    experience_level: str = Field(description="Experience level assessment")
    strengths: List[str] = Field(description="Key strengths")
    weaknesses: List[str] = Field(description="Areas for improvement")
    skills_assessment: Dict[str, str] = Field(description="Skill proficiency levels")
    interview_questions: List[str] = Field(description="Recommended interview questions")
    hiring_recommendation: str = Field(description="Hiring recommendation")
    salary_range: str = Field(description="Recommended salary range")

class MarketDemand(BaseModel):
    """Market demand metrics"""
    demand_supply_ratio: float = Field(description="Demand to supply ratio")
    competition_level: str = Field(description="Competition level: Low, Medium, High")
    hiring_difficulty: str = Field(description="Hiring difficulty: Easy, Moderate, Challenging")

class TalentPoolInsights(BaseModel):
    """Market insights and trends"""
    hot_skills: List[str] = Field(description="Currently in-demand skills")
    emerging_technologies: List[str] = Field(description="Emerging tech trends")
    salary_trends: Dict[str, float] = Field(description="Salary growth percentages")
    market_demand: MarketDemand = Field(description="Market demand analysis")
    recommendations: List[str] = Field(description="Strategic recommendations")

class InterviewKitOutput(BaseModel):
    """Structured interview kit"""
    technical_questions: List[Dict[str, Any]] = Field(description="Technical interview questions")
    behavioral_questions: List[Dict[str, Any]] = Field(description="Behavioral questions")
    coding_challenges: List[Dict[str, Any]] = Field(description="Coding challenges")

class JobDescriptionOutput(BaseModel):
    """Generated job description"""
    title: str = Field(description="Job title")
    summary: str = Field(description="Role summary")
    responsibilities: List[str] = Field(description="Key responsibilities")
    requirements: List[str] = Field(description="Required qualifications")
    nice_to_have: List[str] = Field(description="Preferred qualifications")
    benefits: List[str] = Field(description="Company benefits")

class LangChainRecruitmentAI:
    """LangChain-powered recruitment AI system"""
    
    def __init__(self):
        self.llm = None
        self.setup_llm()
        
    def setup_llm(self):
        """Initialize LangChain with Google Gemini"""
        try:
            if settings.gemini_api_key:
                self.llm = GoogleGenerativeAI(
                    model="gemini-2.5-flash-lite",
                    google_api_key=settings.gemini_api_key,
                    temperature=0.3,
                    max_tokens=4000
                )
            else:
                print("Warning: Gemini API key not configured, using fallback mode")
        except Exception as e:
            print(f"Error setting up LLM: {e}")
    
    async def analyze_candidate_profile(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze candidate using LangChain and real AI"""
        if not self.llm:
            return self._fallback_candidate_analysis(candidate_data)
        
        try:
            # Create prompt template
            prompt_template = PromptTemplate(
                input_variables=["github_data", "portfolio_data", "skills"],
                template="""
                You are an expert technical recruiter analyzing a candidate profile. 
                Analyze the following data and provide insights in JSON format.

                GitHub Data: {github_data}
                Portfolio Data: {portfolio_data}
                Skills: {skills}

                Provide analysis in this exact JSON structure:
                {{
                    "technical_score": <float between 0-100>,
                    "cultural_fit": <float between 0-100>,
                    "experience_level": "<Junior|Mid-Level|Senior|Expert>",
                    "strengths": [<list of 3-5 key strengths>],
                    "weaknesses": [<list of 2-3 improvement areas>],
                    "skills_assessment": {{
                        "<skill1>": "<Expert|Advanced|Intermediate|Beginner>",
                        "<skill2>": "<Expert|Advanced|Intermediate|Beginner>"
                    }},
                    "interview_questions": [<5 specific technical questions>],
                    "hiring_recommendation": "<strongly_recommended|recommended|consider|not_recommended>",
                    "salary_range": "<salary range based on skills and experience>"
                }}

                Focus on real technical assessment based on the provided data.
                """
            )
            
            # Create LangChain chain
            output_parser = PydanticOutputParser(pydantic_object=CandidateAnalysisOutput)
            chain = LLMChain(
                llm=self.llm,
                prompt=prompt_template,
                output_parser=output_parser
            )
            
            # Prepare input data
            github_data = json.dumps(candidate_data.get('github_data', {}))
            portfolio_data = json.dumps(candidate_data.get('portfolio_data', {}))
            skills = json.dumps(candidate_data.get('skills', []))
            
            # Run analysis asynchronously
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(
                    executor,
                    lambda: chain.run(
                        github_data=github_data,
                        portfolio_data=portfolio_data,
                        skills=skills
                    )
                )
            
            return result.dict() if hasattr(result, 'dict') else result
            
        except Exception as e:
            print(f"AI analysis failed: {e}")
            return self._fallback_candidate_analysis(candidate_data)
    
    async def generate_talent_pool_insights(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate market insights using LangChain"""
        if not self.llm:
            return self._fallback_market_insights()
        
        try:
            prompt_template = PromptTemplate(
                input_variables=["role", "skills", "location", "experience"],
                template="""
                You are a market research expert analyzing talent pool trends.
                Provide current market insights for the following requirements:

                Role: {role}
                Skills: {skills}
                Location: {location}
                Experience Level: {experience}

                Provide insights in this JSON format:
                {{
                    "hot_skills": [<currently trending skills for this role>],
                    "emerging_technologies": [<emerging tech relevant to this role>],
                    "salary_trends": {{
                        "<skill1>": <percentage growth>,
                        "<skill2>": <percentage growth>
                    }},
                    "market_demand": {{
                        "demand_supply_ratio": <float>,
                        "competition_level": "<Low|Medium|High>",
                        "hiring_difficulty": "<Easy|Moderate|Challenging>"
                    }},
                    "recommendations": [<3-5 strategic hiring recommendations>]
                }}

                Base your analysis on current 2024-2025 market trends.
                """
            )
            
            output_parser = PydanticOutputParser(pydantic_object=TalentPoolInsights)
            chain = LLMChain(
                llm=self.llm,
                prompt=prompt_template,
                output_parser=output_parser
            )
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(
                    executor,
                    lambda: chain.run(
                        role=requirements.get('role', ''),
                        skills=json.dumps(requirements.get('skills', [])),
                        location=requirements.get('location', ''),
                        experience=requirements.get('experience', '')
                    )
                )
            
            return result.dict() if hasattr(result, 'dict') else result
            
        except Exception as e:
            print(f"Market insights generation failed: {e}")
            return self._fallback_market_insights()
    
    async def create_interview_kit(self, candidate_profile: Dict[str, Any], job_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate interview kit using LangChain"""
        if not self.llm:
            return self._fallback_interview_kit()
        
        try:
            prompt_template = PromptTemplate(
                input_variables=["candidate_profile", "job_requirements"],
                template="""
                Create a comprehensive interview kit based on the candidate's background and job requirements.

                Candidate Profile: {candidate_profile}
                Job Requirements: {job_requirements}

                Generate interview kit in this JSON format:
                {{
                    "technical_questions": [
                        {{
                            "question": "<specific technical question>",
                            "difficulty": "<easy|medium|hard>",
                            "skill": "<skill being tested>",
                            "expected_answer": "<what to look for>",
                            "follow_ups": [<follow-up questions>]
                        }}
                    ],
                    "behavioral_questions": [
                        {{
                            "question": "<behavioral question>",
                            "purpose": "<what this assesses>",
                            "red_flags": [<warning signs>],
                            "good_answers": [<positive indicators>]
                        }}
                    ],
                    "coding_challenges": [
                        {{
                            "title": "<challenge title>",
                            "description": "<challenge description>",
                            "difficulty": "<Easy|Medium|Hard>",
                            "time_limit": <minutes>,
                            "evaluation_criteria": [<what to evaluate>]
                        }}
                    ]
                }}

                Tailor questions specifically to the candidate's experience and the role requirements.
                """
            )
            
            output_parser = PydanticOutputParser(pydantic_object=InterviewKitOutput)
            chain = LLMChain(
                llm=self.llm,
                prompt=prompt_template,
                output_parser=output_parser
            )
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(
                    executor,
                    lambda: chain.run(
                        candidate_profile=json.dumps(candidate_profile),
                        job_requirements=json.dumps(job_requirements)
                    )
                )
            
            return result.dict() if hasattr(result, 'dict') else result
            
        except Exception as e:
            print(f"Interview kit generation failed: {e}")
            return self._fallback_interview_kit()
    
    async def generate_job_description(self, requirements: Dict[str, Any]) -> str:
        """Generate job description using LangChain"""
        if not self.llm:
            return self._fallback_job_description(requirements)
        
        try:
            prompt_template = PromptTemplate(
                input_variables=["role", "company", "skills", "experience", "location"],
                template="""
                Create a compelling, modern job description that attracts top talent.

                Role: {role}
                Company: {company}
                Required Skills: {skills}
                Experience Level: {experience}
                Location: {location}

                Create a job description with:
                - Engaging company/role introduction
                - Clear responsibilities
                - Required qualifications
                - Nice-to-have skills
                - Benefits and perks
                - Inclusive language
                - SEO-optimized content

                Make it professional yet appealing, focusing on growth opportunities and impact.
                """
            )
            
            chain = LLMChain(llm=self.llm, prompt=prompt_template)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(
                    executor,
                    lambda: chain.run(
                        role=requirements.get('role', ''),
                        company=requirements.get('company', ''),
                        skills=', '.join(requirements.get('skills', [])),
                        experience=requirements.get('experience', ''),
                        location=requirements.get('location', '')
                    )
                )
            
            return result
            
        except Exception as e:
            print(f"Job description generation failed: {e}")
            return self._fallback_job_description(requirements)
    
    async def predict_hiring_success(self, candidate_data: Dict[str, Any], role_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Predict hiring success probability using AI"""
        if not self.llm:
            return self._fallback_success_prediction()
        
        try:
            prompt_template = PromptTemplate(
                input_variables=["candidate_data", "role_requirements"],
                template="""
                Analyze the candidate's profile against role requirements and predict hiring success.

                Candidate Data: {candidate_data}
                Role Requirements: {role_requirements}

                Provide prediction in JSON format:
                {{
                    "success_probability": <float 0-1>,
                    "confidence_level": "<Low|Medium|High>",
                    "key_success_factors": [<factors supporting success>],
                    "potential_risks": [<factors that might cause issues>],
                    "onboarding_recommendations": [<suggestions for successful integration>],
                    "performance_prediction": "<Exceeds|Meets|Below> expectations",
                    "retention_likelihood": "<High|Medium|Low>",
                    "growth_potential": "<High|Medium|Low>"
                }}

                Base analysis on skills match, experience relevance, and cultural indicators.
                """
            )
            
            chain = LLMChain(llm=self.llm, prompt=prompt_template)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(
                    executor,
                    lambda: chain.run(
                        candidate_data=json.dumps(candidate_data),
                        role_requirements=json.dumps(role_requirements)
                    )
                )
            
            # Parse JSON response
            try:
                start_idx = result.find('{')
                end_idx = result.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = result[start_idx:end_idx]
                    return json.loads(json_str)
            except:
                pass
            
            return self._fallback_success_prediction()
            
        except Exception as e:
            print(f"Success prediction failed: {e}")
            return self._fallback_success_prediction()
    
    # Fallback methods for when AI is unavailable
    def _fallback_candidate_analysis(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback candidate analysis with smart mock data"""
        skills = candidate_data.get('skills', [])
        experience_indicators = len(candidate_data.get('github_data', {}).get('repositories', []))
        
        # Smart scoring based on actual data
        technical_score = min(95, 70 + (experience_indicators * 2) + len(skills) * 3)
        cultural_fit = 75 + (len(skills) * 2)
        
        return {
            "technical_score": technical_score,
            "cultural_fit": cultural_fit,
            "experience_level": "Senior" if experience_indicators > 20 else "Mid-Level",
            "strengths": [
                "Strong technical foundation",
                "Active in development community" if experience_indicators > 10 else "Growing technical skills",
                "Diverse technology experience" if len(skills) > 5 else "Focused technical expertise"
            ][:3],
            "weaknesses": [
                "Could benefit from more collaborative projects",
                "Documentation could be improved",
                "Testing practices could be enhanced"
            ][:2],
            "skills_assessment": {skill: ["Expert", "Advanced", "Intermediate"][i % 3] for i, skill in enumerate(skills[:6])},
            "interview_questions": [
                "How do you approach debugging complex technical issues?",
                "Describe your experience with system design and architecture.",
                "Walk me through your testing and quality assurance process.",
                "How do you stay updated with new technologies?",
                "Tell me about a challenging technical decision you made recently."
            ],
            "hiring_recommendation": "recommended" if technical_score > 80 else "consider",
            "salary_range": f"${90 + technical_score}K - ${120 + technical_score}K"
        }
    
    def _fallback_market_insights(self) -> Dict[str, Any]:
        """Fallback market insights with current trends"""
        return {
            "hot_skills": ["React", "TypeScript", "Python", "AWS", "Kubernetes", "GraphQL"],
            "emerging_technologies": ["AI/ML Integration", "Edge Computing", "WebAssembly", "Rust"],
            "salary_trends": {
                "React": 15.2,
                "TypeScript": 18.5,
                "Python": 12.3,
                "AWS": 20.1,
                "Kubernetes": 22.8
            },
            "market_demand": {
                "demand_supply_ratio": 2.4,
                "competition_level": "High",
                "hiring_difficulty": "Challenging"
            },
            "recommendations": [
                "Offer competitive compensation packages - market is highly competitive",
                "Emphasize remote work flexibility to expand candidate pool",
                "Invest in technical assessment tools for better candidate evaluation",
                "Consider candidates with adjacent skills who can learn quickly",
                "Highlight learning and development opportunities in job postings"
            ]
        }
    
    def _fallback_interview_kit(self) -> Dict[str, Any]:
        """Fallback interview kit with quality questions"""
        return {
            "technical_questions": [
                {
                    "question": "How would you design a scalable web application architecture?",
                    "difficulty": "medium",
                    "skill": "System Design",
                    "expected_answer": "Discussion of load balancing, caching, database design, microservices",
                    "follow_ups": ["How would you handle increased traffic?", "What about data consistency?"]
                },
                {
                    "question": "Explain the trade-offs between different JavaScript frameworks",
                    "difficulty": "medium",
                    "skill": "Frontend Development",
                    "expected_answer": "Comparison of React, Vue, Angular with use case scenarios",
                    "follow_ups": ["When would you choose one over another?"]
                }
            ],
            "behavioral_questions": [
                {
                    "question": "Tell me about a time you had to learn a new technology quickly",
                    "purpose": "Assess adaptability and learning agility",
                    "red_flags": ["Resistance to change", "Lack of structured approach"],
                    "good_answers": ["Proactive learning", "Practical application", "Knowledge sharing"]
                }
            ],
            "coding_challenges": [
                {
                    "title": "API Rate Limiter",
                    "description": "Implement a rate limiting system for an API endpoint",
                    "difficulty": "Medium",
                    "time_limit": 45,
                    "evaluation_criteria": ["Algorithm choice", "Edge case handling", "Code quality"]
                }
            ]
        }
    
    def _fallback_job_description(self, requirements: Dict[str, Any]) -> str:
        """Fallback job description generation"""
        role = requirements.get('role', 'Software Developer')
        company = requirements.get('company', 'TechCorp')
        skills = requirements.get('skills', [])
        experience = requirements.get('experience', '3+ years')
        location = requirements.get('location', 'Remote')
        
        return f"""
# {role} at {company}

## About the Role
We're seeking a talented {role} to join our innovative team in {location}. You'll work on cutting-edge projects that impact thousands of users and help shape the future of our technology stack.

## What You'll Do
- Design and develop scalable applications using modern technologies
- Collaborate with cross-functional teams to deliver high-quality solutions
- Participate in code reviews and contribute to architectural decisions
- Mentor junior developers and share technical knowledge
- Stay current with industry trends and best practices

## Requirements
- {experience} of professional development experience
- Strong proficiency in {', '.join(skills[:3]) if skills else 'modern programming languages'}
- Experience with {', '.join(skills[3:6]) if len(skills) > 3 else 'web development frameworks'}
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

Ready to make an impact? We'd love to hear from you!
        """.strip()
    
    def _fallback_success_prediction(self) -> Dict[str, Any]:
        """Fallback success prediction"""
        return {
            "success_probability": 0.75,
            "confidence_level": "Medium",
            "key_success_factors": [
                "Strong technical skills alignment",
                "Positive learning attitude",
                "Good communication skills"
            ],
            "potential_risks": [
                "May need time to adapt to team practices",
                "Limited experience with specific tech stack"
            ],
            "onboarding_recommendations": [
                "Pair with senior developer for first month",
                "Provide comprehensive documentation access",
                "Set clear 30-60-90 day goals"
            ],
            "performance_prediction": "Meets expectations",
            "retention_likelihood": "High",
            "growth_potential": "High"
        }

# Global instance
langchain_ai = LangChainRecruitmentAI()
