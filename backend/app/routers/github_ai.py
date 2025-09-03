from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.github_service import GitHubService
from app.services.ai_service import AIService
from app.services.cache_service import cache_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
github_service = GitHubService()
ai_service = AIService()

# Handle preflight OPTIONS requests
@router.options("/analyze")
async def options_analyze():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@router.options("/suggestions")
async def options_suggestions():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

class GitHubAnalyzeRequest(BaseModel):
    username: str

class AISuggestionsRequest(BaseModel):
    username: str
    suggestion_type: str = "career"  # career, technical, portfolio

class GitHubRepo(BaseModel):
    name: str
    description: str
    language: str
    stars: int
    forks: int
    url: str

class AIInsights(BaseModel):
    code_quality_score: float
    technical_skills: Dict[str, float]
    experience_level: str
    strengths: List[str]
    recommendations: List[str]

class GitHubAnalysisResponse(BaseModel):
    repositories: List[GitHubRepo]
    ai_insights: AIInsights

@router.post("/analyze", response_model=GitHubAnalysisResponse)
async def analyze_github_profile(request: GitHubAnalyzeRequest):
    """
    Analyze a GitHub profile with AI insights and caching.
    Uses cache to avoid repeated API calls for the same user.
    """
    try:
        username = request.username.lower()
        
        # Check cache first
        cached_result = await cache_service.get_analysis_cache(username)
        if cached_result:
            logger.info(f"Returning cached analysis for {username}")
            # Convert cached data to response model
            repositories = [GitHubRepo(**repo) for repo in cached_result.get("repositories", [])]
            ai_insights = AIInsights(**cached_result.get("ai_insights", {}))
            return GitHubAnalysisResponse(repositories=repositories, ai_insights=ai_insights)
        
        # Get GitHub repositories
        repos_data = await github_service.get_user_repositories(request.username)
        
        # Convert to our format
        repositories = []
        for repo in repos_data:
            repositories.append(GitHubRepo(
                name=repo.get('name', ''),
                description=repo.get('description', '') or '',
                language=repo.get('language', '') or 'Unknown',
                stars=repo.get('stargazers_count', 0),
                forks=repo.get('forks_count', 0),
                url=repo.get('html_url', '')
            ))
        
        # Get AI analysis using available method
        ai_analysis = await ai_service.analyze_profile(repos_data)
        
        # Extract and format AI insights with proper fallbacks
        technical_skills = ai_analysis.get('technical_skills', {})
        
        # Calculate code quality score from the analysis
        overall_quality = ai_analysis.get('project_quality_assessment', {}).get('overall_quality', 'moderate')
        confidence = ai_analysis.get('analysis_confidence', 0.0)
        
        # Map quality to score
        quality_scores = {'low': 0.3, 'moderate': 0.6, 'high': 0.85, 'excellent': 0.95}
        base_score = quality_scores.get(overall_quality, 0.6)
        code_quality_score = base_score * confidence * 100
        
        # Extract strengths and recommendations
        specializations = ai_analysis.get('specializations', [])
        strengths = specializations[:3] if specializations else ['Technical skills development needed']
        
        # Create recommendations based on analysis
        recommendations = []
        if ai_analysis.get('project_quality_assessment', {}).get('documentation_quality') == 'low':
            recommendations.append('Improve project documentation and README files')
        if ai_analysis.get('project_quality_assessment', {}).get('testing_evidence') == 'low':
            recommendations.append('Add unit tests and testing coverage')
        if not ai_analysis.get('collaboration_patterns', {}).get('contributes_to_open_source'):
            recommendations.append('Contribute to open source projects to showcase collaboration skills')
        
        # Format AI insights
        ai_insights = AIInsights(
            code_quality_score=round(code_quality_score, 1),
            technical_skills=technical_skills,
            experience_level=ai_analysis.get('experience_level', 'Beginner'),
            strengths=strengths,
            recommendations=recommendations[:3] if recommendations else ['Continue building diverse projects']
        )
        
        # Cache the result
        cache_data = {
            "repositories": [repo.dict() for repo in repositories],
            "ai_insights": ai_insights.dict()
        }
        await cache_service.save_analysis_cache(username, cache_data)
        
        return GitHubAnalysisResponse(
            repositories=repositories,
            ai_insights=ai_insights
        )
        
    except Exception as e:
        logger.error(f"Error analyzing profile {request.username}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze GitHub profile: {str(e)}")

@router.post("/suggestions")
async def get_ai_suggestions(request: AISuggestionsRequest):
    """
    Get AI-powered suggestions for career, technical growth, or portfolio improvement.
    """
    try:
        username = request.username.lower()
        
        # Get cached analysis or perform new analysis
        cached_result = await cache_service.get_analysis_cache(username)
        if not cached_result:
            # No cached data, need fresh analysis
            repos_data = await github_service.get_user_repositories(request.username)
            if not repos_data:
                raise HTTPException(status_code=404, detail=f"No repositories found for user {request.username}")
            
            analysis = await ai_service.analyze_profile(repos_data)
            if "error" in analysis:
                raise HTTPException(status_code=500, detail=f"AI analysis failed: {analysis['error']}")
        else:
            analysis = cached_result.get("ai_insights", {})
            repos_data = [
                {
                    "name": repo["name"],
                    "description": repo.get("description", ""),
                    "language": repo.get("language", "")
                }
                for repo in cached_result.get("repositories", [])
            ]
        
        if request.suggestion_type == "career":
            # Generate career recommendations
            suggestions = await ai_service.generate_candidate_summary({
                "analysis": analysis,
                "repositories": repos_data[:5]  # Top 5 repos
            })
            
            return {
                "type": "career",
                "suggestions": suggestions.get("fit_analysis", {}),
                "career_paths": suggestions.get("fit_analysis", {}).get("best_suited_for", [
                    "Full-stack Developer", "Software Engineer", "Frontend Developer"
                ]),
                "growth_areas": suggestions.get("potential_red_flags", [
                    "Add more testing to projects", "Improve documentation"
                ]),
                "summary": suggestions.get("candidate_summary", 
                    "Developing software engineer with strong foundation in modern technologies.")
            }
            
        elif request.suggestion_type == "technical":
            # Generate technical improvement suggestions
            craftsmanship = await ai_service.calculate_craftsmanship_score(repos_data[:10])
            
            return {
                "type": "technical",
                "current_score": craftsmanship.get("overall_score", 65.0),
                "strengths": craftsmanship.get("strengths", [
                    "Good project organization", "Consistent naming conventions"
                ]),
                "improvement_areas": craftsmanship.get("improvement_areas", [
                    "Add unit tests", "Improve documentation", "Add CI/CD"
                ]),
                "recommendations": craftsmanship.get("recommendations", [
                    "Implement testing frameworks in key projects",
                    "Create comprehensive README files",
                    "Add live demo links to showcase projects"
                ]),
                "next_steps": [
                    "Focus on testing - add unit tests to your main projects",
                    "Improve documentation - create detailed README files",
                    "Code organization - follow consistent project structure",
                    "Open source - contribute to existing projects or create reusable libraries"
                ]
            }
            
        elif request.suggestion_type == "portfolio":
            # Generate portfolio improvement suggestions
            portfolio_content = await ai_service.generate_portfolio_content(analysis, repos_data[:8])
            
            return {
                "type": "portfolio",
                "bio_suggestion": portfolio_content.get("bio", 
                    "Passionate developer building innovative solutions with modern technologies."),
                "skills_summary": portfolio_content.get("skills_summary",
                    "Strong foundation in web development with experience in multiple programming languages."),
                "project_highlights": portfolio_content.get("project_descriptions", {}),
                "improvement_tips": [
                    "Add live demo links to your projects",
                    "Include detailed project descriptions with impact metrics",
                    "Showcase your problem-solving approach in README files",
                    "Add screenshots or GIFs to demonstrate functionality",
                    "Create a personal website to host your portfolio"
                ]
            }
            
        else:
            raise HTTPException(status_code=400, detail="Invalid suggestion_type. Use: career, technical, or portfolio")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating suggestions for {request.username}: {e}")
        raise HTTPException(status_code=500, detail=f"Suggestion generation failed: {str(e)}")

@router.delete("/cache/{username}")
async def clear_user_cache(username: str):
    """Clear cache for a specific user (useful for testing or forced refresh)."""
    try:
        success = await cache_service.clear_user_cache(username.lower())
        return {"success": success, "message": f"Cache cleared for {username}"}
    except Exception as e:
        logger.error(f"Error clearing cache for {username}: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear cache")

@router.get("/user/{username}")
async def get_github_user(username: str):
    """
    Get basic GitHub user information
    """
    try:
        # For now, return user repos data since we don't have get_user_info method
        repos = await github_service.get_user_repositories(username)
        return {"username": username, "repositories_count": len(repos), "repositories": repos[:5]}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"GitHub user not found: {str(e)}")

@router.get("/user/{username}/stats")
async def get_github_stats(username: str):
    """
    Get GitHub statistics for a user
    """
    try:
        stats = await github_service.get_user_activity_stats(username)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get GitHub stats: {str(e)}")
