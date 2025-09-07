from fastapi import APIRouter, HTTPException, Depends
from app.services.github_service import GitHubService
from app.services.cache_service import CacheService
from app.services.ai_service import AIService
from app.core.database import get_database
from pydantic import BaseModel
from typing import Dict, Any, List
import json

router = APIRouter()

class GitHubAnalyzeRequest(BaseModel):
    username: str

class GitHubSuggestionsRequest(BaseModel):
    username: str
    suggestion_type: str = "career"

@router.post("/analyze")
async def analyze_github_profile(
    request: GitHubAnalyzeRequest
):
    """
    Analyze GitHub profile with AI insights.
    This is the endpoint the frontend is calling.
    """
    try:
        github_service = GitHubService()
        ai_service = AIService()
        cache_service = CacheService()
        
        username = request.username
        cache_key = f"github_analysis_{username}"
        
        # Check cache first
        cached_analysis = await cache_service.get_analysis_cache(username)
        if cached_analysis:
            return cached_analysis
        
        # Get repositories from GitHub
        repos = await github_service.get_user_repositories(username)
        if not repos:
            raise HTTPException(status_code=404, detail=f"No repositories found for user {username}")
        
        # Get AI analysis
        ai_analysis = await ai_service.analyze_profile(repos)
        
        # Ensure we have a code_quality_score
        if not ai_analysis.get("code_quality_score"):
            # Calculate a basic score based on repository metrics
            total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
            avg_stars = total_stars / max(len(repos), 1)
            has_docs = sum(1 for repo in repos if repo.get("has_readme", False))
            doc_ratio = has_docs / max(len(repos), 1)
            
            # Simple scoring algorithm
            base_score = min(50, len(repos) * 2)  # Base score from number of repos
            star_bonus = min(30, avg_stars * 5)   # Bonus from stars
            doc_bonus = min(20, doc_ratio * 20)   # Bonus from documentation
            
            calculated_score = int(base_score + star_bonus + doc_bonus)
            ai_analysis["code_quality_score"] = calculated_score
        
        # Format response
        analysis_result = {
            "username": username,
            "repositories_count": len(repos),
            "repositories": repos[:10],  # Top 10 repos
            "ai_insights": ai_analysis,
            "timestamp": "2025-09-05T00:00:00Z"
        }
        
        # Cache for 6 hours
        await cache_service.save_analysis_cache(username, analysis_result)
        
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        # Return fallback analysis
        return {
            "username": request.username,
            "repositories_count": 0,
            "repositories": [],
            "ai_insights": {
                "technical_skills": {"JavaScript": 0.8, "Python": 0.7},
                "experience_level": "intermediate",
                "specializations": ["Web Development"],
                "error": f"Analysis failed: {str(e)}"
            },
            "timestamp": "2025-09-05T00:00:00Z"
        }

@router.post("/suggestions")
async def get_github_suggestions(
    request: GitHubSuggestionsRequest
):
    """
    Generate AI-powered career and technical suggestions based on GitHub profile.
    """
    try:
        github_service = GitHubService()
        ai_service = AIService()
        cache_service = CacheService()
        
        username = request.username
        suggestion_type = request.suggestion_type
        cache_key = f"github_suggestions_{suggestion_type}_{username}"
        
        # Check cache first
        cached_suggestions = await cache_service.get_analysis_cache(f"suggestions_{suggestion_type}_{username}")
        if cached_suggestions:
            return cached_suggestions
        
        # Get repositories from GitHub
        repos = await github_service.get_user_repositories(username)
        if not repos:
            raise HTTPException(status_code=404, detail=f"No repositories found for user {username}")
        
        # Generate different types of suggestions
        if suggestion_type == "career":
            suggestions_result = await _generate_career_suggestions(ai_service, repos, username)
        elif suggestion_type == "technical":
            suggestions_result = await _generate_technical_suggestions(ai_service, repos, username)
        elif suggestion_type == "portfolio":
            suggestions_result = await _generate_portfolio_suggestions(ai_service, repos, username)
        else:
            suggestions_result = await _generate_career_suggestions(ai_service, repos, username)
        
        # Cache for 6 hours
        await cache_service.save_analysis_cache(f"suggestions_{suggestion_type}_{username}", suggestions_result)
        
        return suggestions_result
        
    except HTTPException:
        raise
    except Exception as e:
        # Return fallback suggestions
        return _generate_fallback_suggestions(request.username, request.suggestion_type)

async def _generate_career_suggestions(ai_service: AIService, repos: List[Dict], username: str) -> Dict[str, Any]:
    """Generate career-focused suggestions"""
    try:
        # Get AI analysis
        profile_analysis = await ai_service.analyze_profile(repos)
        
        # Calculate experience level
        experience_level = profile_analysis.get("experience_level", "intermediate")
        tech_skills = profile_analysis.get("technical_skills", {})
        
        # Generate career paths based on skills
        career_paths = []
        if "JavaScript" in tech_skills or "React" in str(repos):
            career_paths.append("Frontend Developer")
            career_paths.append("Full-Stack Developer")
        if "Python" in tech_skills:
            career_paths.append("Backend Developer")
            career_paths.append("Data Scientist")
        if "Java" in tech_skills or "C++" in tech_skills:
            career_paths.append("Software Engineer")
            career_paths.append("Systems Developer")
        
        if not career_paths:
            career_paths = ["Software Developer", "Full-Stack Developer"]
        
        # Generate growth areas
        growth_areas = [
            "Contribute to more open source projects",
            "Build full-stack applications with deployment",
            "Learn modern testing frameworks",
            "Develop leadership and mentoring skills"
        ]
        
        return {
            "type": "career",
            "summary": f"Based on your {len(repos)} repositories and {experience_level} level experience, you show strong potential for growth in multiple technical directions.",
            "career_paths": career_paths[:4],
            "growth_areas": growth_areas,
            "next_steps": [
                "Build 2-3 portfolio projects showcasing different skills",
                "Contribute to open source projects in your field",
                "Network with other developers in your area of interest",
                "Consider pursuing relevant certifications"
            ]
        }
    except Exception:
        return _generate_fallback_suggestions(username, "career")

async def _generate_technical_suggestions(ai_service: AIService, repos: List[Dict], username: str) -> Dict[str, Any]:
    """Generate technical skill suggestions"""
    try:
        # Get AI analysis
        profile_analysis = await ai_service.analyze_profile(repos)
        
        tech_skills = profile_analysis.get("technical_skills", {})
        
        # Calculate average score
        avg_score = int(sum(tech_skills.values()) * 100 / max(len(tech_skills), 1)) if tech_skills else 65
        
        strengths = []
        improvement_areas = []
        
        for skill, level in tech_skills.items():
            if level > 0.7:
                strengths.append(f"Strong proficiency in {skill}")
            elif level < 0.5:
                improvement_areas.append(f"Enhance {skill} skills through practice projects")
        
        if not strengths:
            strengths = ["Good programming fundamentals", "Active learning and development"]
        
        if not improvement_areas:
            improvement_areas = ["Add more comprehensive documentation", "Implement testing in projects"]
        
        return {
            "type": "technical",
            "current_score": avg_score,
            "strengths": strengths[:5],
            "improvement_areas": improvement_areas[:5],
            "next_steps": [
                "Focus on one technology stack for deeper expertise",
                "Implement unit testing in your projects",
                "Add comprehensive README files to repositories",
                "Build projects that demonstrate problem-solving skills",
                "Practice system design and architecture"
            ]
        }
    except Exception:
        return _generate_fallback_suggestions(username, "technical")

async def _generate_portfolio_suggestions(ai_service: AIService, repos: List[Dict], username: str) -> Dict[str, Any]:
    """Generate portfolio improvement suggestions"""
    try:
        # Analyze repositories for portfolio content
        project_highlights = {}
        for repo in repos[:5]:
            if repo.get("description"):
                project_highlights[repo["name"]] = f"{repo['description']} - Built with {repo.get('language', 'various technologies')}"
        
        return {
            "type": "portfolio",
            "bio_suggestion": f"Passionate developer with {len(repos)} projects showcasing expertise in modern web technologies. Experienced in building scalable applications and contributing to open source projects.",
            "skills_summary": f"Proficient in multiple programming languages with hands-on experience in {len(repos)} diverse projects. Strong problem-solving skills and commitment to clean, maintainable code.",
            "project_highlights": project_highlights,
            "improvement_tips": [
                "Add live demo links to your best projects",
                "Include detailed setup instructions in README files",
                "Showcase your problem-solving approach in project descriptions",
                "Add screenshots or GIFs to demonstrate project functionality",
                "Create a cohesive visual theme across your repositories"
            ]
        }
    except Exception:
        return _generate_fallback_suggestions(username, "portfolio")

def _generate_fallback_suggestions(username: str, suggestion_type: str) -> Dict[str, Any]:
    """Generate fallback suggestions when AI fails"""
    if suggestion_type == "career":
        return {
            "type": "career",
            "summary": "Based on your GitHub activity, you show good potential for software development careers.",
            "career_paths": ["Software Developer", "Full-Stack Developer", "Backend Developer"],
            "growth_areas": ["Build more complex projects", "Contribute to open source", "Learn new technologies"],
            "next_steps": ["Create portfolio projects", "Network with developers", "Practice coding regularly"]
        }
    elif suggestion_type == "technical":
        return {
            "type": "technical",
            "current_score": 70,
            "strengths": ["Active development", "Multiple programming languages"],
            "improvement_areas": ["Add documentation", "Implement testing"],
            "next_steps": ["Focus on code quality", "Learn testing frameworks", "Add project documentation"]
        }
    else:  # portfolio
        return {
            "type": "portfolio",
            "bio_suggestion": f"Dedicated developer with a passion for creating innovative solutions.",
            "skills_summary": "Experienced in software development with a focus on clean, efficient code.",
            "project_highlights": {"Sample Project": "Demonstrates technical skills and problem-solving ability"},
            "improvement_tips": ["Add project demos", "Improve documentation", "Showcase your best work"]
        }

@router.get("/stats/{username}")
async def get_github_stats(
    username: str,
    db=Depends(get_database)
):
    """
    Get comprehensive GitHub statistics for a user.
    Results are cached for 1 hour to reduce API calls.
    """
    try:
        cache_service = CacheService(db)
        github_service = GitHubService()
        
        # Check cache first
        cache_key = f"github_stats_{username}"
        cached_stats = await cache_service.get(cache_key)
        
        if cached_stats:
            return json.loads(cached_stats)
        
        # Fetch fresh data from GitHub
        activity_stats = await github_service.get_user_activity_stats(username)
        
        # Get additional user data
        try:
            # Try to get user data without token first (public data)
            user_data = await github_service.get_user_data_public(username)
        except:
            # If that fails, use basic info
            user_data = {
                "followers": 0,
                "following": 0,
                "public_repos": activity_stats.get("total_repositories", 0)
            }
        
        # Combine all stats
        comprehensive_stats = {
            "username": username,
            "user_data": user_data,
            "total_repositories": activity_stats.get("total_repositories", 0),
            "total_stars": activity_stats.get("total_stars", 0),
            "total_forks": activity_stats.get("total_forks", 0),
            "top_languages": activity_stats.get("top_languages", []),
            "recent_activity": activity_stats.get("recent_activity", 0),
            "most_starred_repo": activity_stats.get("most_starred_repo"),
            "recent_repositories": activity_stats.get("recent_repositories", []),
            "total_commits": await estimate_total_commits(github_service, username),
            "last_updated": "2025-09-05T00:00:00Z"
        }
        
        # Cache for 1 hour
        await cache_service.set(
            cache_key, 
            json.dumps(comprehensive_stats, default=str), 
            expire_seconds=3600
        )
        
        return comprehensive_stats
        
    except Exception as e:
        # Return mock data if GitHub API fails
        return get_mock_github_stats(username)

async def estimate_total_commits(github_service: GitHubService, username: str) -> int:
    """
    Estimate total commits by sampling recent repositories.
    """
    try:
        repos = await github_service.get_user_repositories(username, per_page=10)
        total_commits = 0
        
        for repo in repos[:5]:  # Sample first 5 repos to avoid rate limits
            commits = await github_service.get_repository_commits(
                username, 
                repo.get("name", "")
            )
            total_commits += len(commits) * 2  # Estimate based on recent commits
        
        return max(total_commits, 100)  # Minimum reasonable number
        
    except:
        return 500  # Default estimate

def get_mock_github_stats(username: str) -> Dict[str, Any]:
    """
    Return mock GitHub stats when API is unavailable.
    """
    return {
        "username": username,
        "user_data": {
            "followers": 150,
            "following": 89,
            "public_repos": 25
        },
        "total_repositories": 25,
        "total_stars": 89,
        "total_forks": 23,
        "top_languages": [
            {"language": "JavaScript", "count": 8},
            {"language": "TypeScript", "count": 6},
            {"language": "Python", "count": 5},
            {"language": "React", "count": 4}
        ],
        "recent_activity": 15,
        "most_starred_repo": {
            "name": "awesome-project",
            "stargazers_count": 45,
            "description": "An awesome project"
        },
        "recent_repositories": [],
        "total_commits": 1250,
        "last_updated": "2025-09-05T00:00:00Z"
    }

@router.get("/repositories/{username}")
async def get_user_repositories(
    username: str,
    per_page: int = 20,
    db=Depends(get_database)
):
    """
    Get user's repositories with caching.
    """
    try:
        cache_service = CacheService(db)
        github_service = GitHubService()
        
        cache_key = f"github_repos_{username}_{per_page}"
        cached_repos = await cache_service.get(cache_key)
        
        if cached_repos:
            return {"repositories": json.loads(cached_repos)}
        
        repos = await github_service.get_user_repositories(username, per_page)
        
        # Cache for 30 minutes
        await cache_service.set(
            cache_key, 
            json.dumps(repos, default=str), 
            expire_seconds=1800
        )
        
        return {"repositories": repos}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch repositories: {str(e)}")

@router.get("/user/{username}")
async def get_github_user_data(username: str):
    """
    Get real GitHub user data directly from GitHub API.
    """
    try:
        github_service = GitHubService()
        
        # Fetch real user data from GitHub API
        user_data = await github_service.get_user_data_public(username)
        
        # Calculate years active
        from datetime import datetime
        created_date = datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00"))
        years_active = max(1, (datetime.now().replace(tzinfo=created_date.tzinfo) - created_date).days // 365)
        
        # Add calculated fields
        user_data["years_active"] = years_active
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Error in get_github_user_data: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user data: {str(e)}")

@router.get("/activity/{username}")
async def get_user_activity(
    username: str,
    db=Depends(get_database)
):
    """
    Get user's recent GitHub activity.
    """
    try:
        cache_service = CacheService(db)
        
        cache_key = f"github_activity_{username}"
        cached_activity = await cache_service.get(cache_key)
        
        if cached_activity:
            return {"activities": json.loads(cached_activity)}
        
        # For now, return mock activity data
        # In production, you would fetch from GitHub Events API
        mock_activities = [
            {
                "id": "1",
                "type": "push",
                "description": f"Pushed commits to {username}/portfolio-website",
                "timestamp": "2025-09-04T18:00:00Z",
                "repository": "portfolio-website"
            },
            {
                "id": "2", 
                "type": "star",
                "description": f"Starred a repository",
                "timestamp": "2025-09-04T12:00:00Z",
                "repository": "awesome-project"
            }
        ]
        
        # Cache for 15 minutes
        await cache_service.set(
            cache_key,
            json.dumps(mock_activities),
            expire_seconds=900
        )
        
        return {"activities": mock_activities}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activity: {str(e)}")
