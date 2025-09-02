from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.github_service import GitHubService
from app.services.ai_service import AIService

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

class GitHubAnalyzeRequest(BaseModel):
    username: str

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
    Analyze a GitHub profile and return AI insights
    """
    try:
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
        
        return GitHubAnalysisResponse(
            repositories=repositories,
            ai_insights=ai_insights
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze GitHub profile: {str(e)}")

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
