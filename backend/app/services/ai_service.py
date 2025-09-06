import google.generativeai as genai
from app.core.config import settings
from typing import List, Dict, Any
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

class AIService:
    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Updated to latest model
        else:
            self.model = None
    
    async def analyze_profile(self, repositories: List[Dict[str, Any]], resume_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Core Feature 1: AI-Powered Profile Analysis
        Analyzes GitHub and resume to provide comprehensive technical skills assessment.
        """
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            prompt = self._create_profile_analysis_prompt(repositories, resume_data)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                response = await loop.run_in_executor(executor, self._generate_response, prompt)
            
            return self._parse_json_response(response.text)
            
        except Exception as e:
            return {"error": f"Profile analysis failed: {str(e)}"}
    
    async def generate_portfolio_content(self, github_data: Dict[str, Any], repositories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Core Feature 2: Automated Portfolio Generation
        Generates AI-written project descriptions, bio, and portfolio content.
        """
        if not self.model:
            return self._generate_fallback_portfolio_content(github_data, repositories)
        
        try:
            prompt = self._create_portfolio_generation_prompt(github_data, repositories)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                response = await loop.run_in_executor(executor, self._generate_response, prompt)
            
            result = self._parse_json_response(response.text)
            
            # Ensure we have fallback content if AI fails
            if result.get("error"):
                return self._generate_fallback_portfolio_content(github_data, repositories)
            
            return result
            
        except Exception as e:
            return self._generate_fallback_portfolio_content(github_data, repositories)
    
    async def calculate_craftsmanship_score(self, repositories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Core Feature 3: Code Craftsmanship Score
        Provides quantifiable score based on code quality, documentation, testing, and structure.
        """
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            prompt = self._create_craftsmanship_scoring_prompt(repositories)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                response = await loop.run_in_executor(executor, self._generate_response, prompt)
            
            return self._parse_json_response(response.text)
            
        except Exception as e:
            return {"error": f"Craftsmanship scoring failed: {str(e)}"}
    
    async def generate_candidate_summary(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Core Feature 5: AI Candidate Summary
        Generates concise summary highlighting strengths, projects, and potential red flags.
        """
        if not self.model:
            return {"error": "Gemini API key not configured"}
        
        try:
            prompt = self._create_candidate_summary_prompt(profile_data)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                response = await loop.run_in_executor(executor, self._generate_response, prompt)
            
            return self._parse_json_response(response.text)
            
        except Exception as e:
            return {"error": f"Candidate summary generation failed: {str(e)}"}
    
    async def generate_interview_questions(self, repositories: List[Dict[str, Any]], profile_analysis: Dict[str, Any]) -> List[str]:
        """
        Core Feature 6: Contextual Interview Question Generator
        Creates personalized technical interview questions based on specific projects and code.
        """
        if not self.model:
            return ["Interview question generation unavailable - Gemini API key not configured."]
        
        try:
            prompt = self._create_interview_questions_prompt(repositories, profile_analysis)
            
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                response = await loop.run_in_executor(executor, self._generate_response, prompt)
            
            result = self._parse_json_response(response.text)
            return result.get("questions", [])
            
        except Exception as e:
            return [f"Interview question generation failed: {str(e)}"]
    
    def _create_profile_analysis_prompt(self, repositories: List[Dict[str, Any]], resume_data: Dict[str, Any] = None) -> str:
        """Create prompt for comprehensive profile analysis."""
        repo_data = json.dumps(repositories, indent=2)
        resume_section = f"\n\nResume Data:\n{json.dumps(resume_data, indent=2)}" if resume_data else ""
        
        return f"""
        Analyze this developer's GitHub profile and resume to provide comprehensive technical assessment.
        
        GitHub Repositories:
        {repo_data}{resume_section}
        
        Provide analysis in JSON format:
        {{
            "technical_skills": {{
                "language1": 0.85,
                "framework1": 0.72,
                "tool1": 0.90
            }},
            "most_active_languages": [
                {{"language": "JavaScript", "repos": 15, "lines_estimated": 50000, "percentage": 35.2}},
                {{"language": "Python", "repos": 8, "lines_estimated": 25000, "percentage": 18.7}}
            ],
            "project_quality_assessment": {{
                "overall_quality": "high",
                "complexity_distribution": {{"simple": 3, "moderate": 8, "complex": 4}},
                "documentation_quality": "excellent",
                "testing_evidence": "good"
            }},
            "experience_level": "senior",
            "specializations": ["Full-stack Web Development", "API Design", "Database Architecture"],
            "collaboration_patterns": {{
                "works_on_team_projects": true,
                "contributes_to_open_source": true,
                "mentoring_evidence": false
            }},
            "code_patterns": {{
                "follows_conventions": true,
                "uses_modern_practices": true,
                "architecture_awareness": "high"
            }},
            "analysis_confidence": 0.87
        }}
        """
    
    def _create_portfolio_generation_prompt(self, github_data: Dict[str, Any], repositories: List[Dict[str, Any]]) -> str:
        """Create prompt for portfolio content generation."""
        user_profile = github_data.get("user_profile", {})
        activity_stats = github_data.get("activity_stats", {})
        
        return f"""
        Generate professional portfolio content based on this GitHub profile and repositories.
        
        User Profile:
        - Name: {user_profile.get('name', 'Not provided')}
        - Bio: {user_profile.get('bio', 'Not provided')}
        - Location: {user_profile.get('location', 'Not provided')}
        - Company: {user_profile.get('company', 'Not provided')}
        - Public Repos: {user_profile.get('public_repos', 0)}
        - Followers: {user_profile.get('followers', 0)}
        
        Activity Stats:
        {json.dumps(activity_stats, indent=2)}
        
        Top Repositories:
        {json.dumps(repositories[:8], indent=2)}
        
        Generate content in JSON format:
        {{
            "suggested_title": "<professional portfolio title>",
            "bio": "<compelling 2-3 sentence professional bio highlighting expertise>",
            "professional_summary": "<2-3 paragraph summary showcasing technical skills and experience>",
            "project_descriptions": {{
                "repo_name_1": "<engaging description highlighting technical choices and impact>",
                "repo_name_2": "<another project description>"
            }},
            "skills_summary": "<paragraph summarizing technical expertise and specializations>",
            "call_to_action": "<professional closing statement for recruiters/collaborators>"
        }}
        
        Make content engaging, professional, and tailored to the developer's actual work.
        Focus on achievements, impact, and technical expertise demonstrated through the repositories.
        """
    
    def _create_craftsmanship_scoring_prompt(self, repositories: List[Dict[str, Any]]) -> str:
        """Create prompt for code craftsmanship scoring."""
        repo_data = json.dumps(repositories, indent=2)
        
        return f"""
        Calculate a Code Craftsmanship Score based on these repositories.
        
        Repositories:
        {repo_data}
        
        Analyze and score in JSON format:
        {{
            "overall_score": 82.5,
            "code_quality_score": 85.0,
            "documentation_score": 78.0,
            "testing_score": 65.0,
            "project_structure_score": 90.0,
            "metrics": {{
                "total_repos_analyzed": 15,
                "repos_with_readme": 13,
                "repos_with_license": 8,
                "avg_stars_per_repo": 3.2,
                "languages_diversity": 6
            }},
            "strengths": [
                "Excellent project organization and structure",
                "Consistent naming conventions",
                "Good use of modern frameworks"
            ],
            "improvement_areas": [
                "Add unit tests to more projects",
                "Include more detailed API documentation",
                "Add contributing guidelines"
            ],
            "recommendations": [
                "Implement testing frameworks in key projects",
                "Create more comprehensive README files",
                "Add live demo links to showcase projects"
            ],
            "analyzed_repositories": 15
        }}
        
        Consider: README quality, project structure, naming conventions, documentation, 
        testing evidence, license usage, commit patterns, and code organization.
        """
    
    def _create_candidate_summary_prompt(self, profile_data: Dict[str, Any]) -> str:
        """Create prompt for recruiter-facing candidate summary."""
        return f"""
        Create a recruiter-focused candidate summary from this profile data.
        
        Profile Data:
        {json.dumps(profile_data, indent=2)}
        
        Generate summary in JSON format:
        {{
            "candidate_summary": "<2-3 paragraph executive summary for recruiters>",
            "core_strengths": [
                "Expert in modern JavaScript frameworks",
                "Strong system design capabilities",
                "Excellent documentation practices"
            ],
            "impressive_projects": [
                {{
                    "name": "Project Name",
                    "description": "Why it's impressive",
                    "impact": "Business or technical impact",
                    "technologies": ["React", "Node.js", "PostgreSQL"]
                }}
            ],
            "potential_red_flags": [
                "Limited testing in some projects",
                "Few contributions to open source"
            ],
            "fit_analysis": {{
                "best_suited_for": ["Full-stack Developer", "Technical Lead"],
                "team_environment": "Works well in collaborative environments",
                "growth_potential": "High - shows continuous learning"
            }}
        }}
        
        Focus on what recruiters need to know for hiring decisions.
        """
    
    def _create_interview_questions_prompt(self, repositories: List[Dict[str, Any]], profile_analysis: Dict[str, Any]) -> str:
        """Create prompt for contextual interview questions."""
        return f"""
        Generate personalized technical interview questions based on this candidate's actual work.
        
        Repositories:
        {json.dumps(repositories[:5], indent=2)}
        
        Profile Analysis:
        {json.dumps(profile_analysis, indent=2)}
        
        Generate questions in JSON format:
        {{
            "questions": [
                "I noticed you built [specific project]. Can you walk me through the architecture decisions you made and why?",
                "In your [project name] repository, you used [specific technology]. What challenges did you face and how did you overcome them?",
                "Looking at your commit history in [project], I see you refactored [specific component]. What drove that decision?",
                "Your [project] seems to handle [specific functionality]. How would you scale this if user load increased 10x?",
                "I see you've worked with [technologies]. How do you decide when to use [tech A] vs [tech B] for a project?"
            ]
        }}
        
        Create 8-10 specific, practical questions that reference their actual projects and code.
        Avoid generic algorithm questions. Focus on real problem-solving and decision-making.
        """
    
    def _generate_response(self, prompt: str):
        """Generate response using Gemini (runs in thread pool)."""
        return self.model.generate_content(prompt)
    
    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON from Gemini response."""
        try:
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
                
        except (json.JSONDecodeError, ValueError):
            return {
                "error": "Failed to parse AI response",
                "raw_response": response_text[:500] + "..." if len(response_text) > 500 else response_text
            }
    
    def _generate_fallback_portfolio_content(self, github_data: Dict[str, Any], repositories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate fallback portfolio content when AI is unavailable."""
        user_profile = github_data.get("user_profile", {})
        activity_stats = github_data.get("activity_stats", {})
        
        name = user_profile.get("name") or user_profile.get("login", "Developer")
        
        # Generate bio
        bio_parts = [f"I'm {name}"]
        if user_profile.get("company"):
            bio_parts.append(f"working at {user_profile['company']}")
        if user_profile.get("location"):
            bio_parts.append(f"based in {user_profile['location']}")
        
        languages = []
        if activity_stats.get("top_languages"):
            languages = [lang["language"] for lang in activity_stats["top_languages"][:3]]
        
        if languages:
            bio_parts.append(f"specializing in {', '.join(languages)}")
        
        bio = ". ".join(bio_parts) + "."
        
        # Generate project descriptions for top repos
        project_descriptions = {}
        for repo in repositories[:5]:
            if repo.get("description"):
                description = repo["description"]
                if repo.get("language"):
                    description += f" Built with {repo['language']}."
                if repo.get("stargazers_count", 0) > 0:
                    description += f" ⭐ {repo['stargazers_count']} stars."
                project_descriptions[repo["name"]] = description
        
        # Generate skills summary
        skills_summary = f"Experienced developer with expertise in {', '.join(languages[:5]) if languages else 'multiple technologies'}."
        if user_profile.get("public_repos"):
            skills_summary += f" {user_profile['public_repos']} public repositories showcasing diverse projects."
        
        return {
            "suggested_title": f"{name} - Developer Portfolio",
            "bio": bio,
            "professional_summary": f"{bio} With {user_profile.get('public_repos', 0)} public repositories and {user_profile.get('followers', 0)} followers, I'm passionate about creating quality software solutions.",
            "project_descriptions": project_descriptions,
            "skills_summary": skills_summary,
            "call_to_action": "Let's connect and build something amazing together!",
            "generated_by": "fallback_system"
        }
