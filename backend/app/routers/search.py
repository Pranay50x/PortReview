from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.models.search import SearchCriteria, SearchResponse, SavedSearch
from app.services.search_service import SearchService
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter()
search_service = SearchService()

@router.post("/search", response_model=SearchResponse)
async def search_candidates(
    criteria: SearchCriteria,
    current_user: User = Depends(get_current_user)
):
    """
    Advanced Candidate Search - Core Feature
    Search developers using nuanced criteria beyond simple keyword matching.
    """
    if current_user.user_type != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can search candidates")
    
    try:
        return await search_service.search_candidates(criteria, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/search/suggestions")
async def get_search_suggestions(
    q: Optional[str] = Query(None, description="Partial query for suggestions"),
    current_user: User = Depends(get_current_user)
):
    """Get search suggestions for auto-completion."""
    if current_user.user_type != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can access search suggestions")
    
    # Common skills and technologies for suggestions
    suggestions = {
        "skills": [
            "JavaScript", "Python", "React", "Node.js", "TypeScript", "Java",
            "Go", "Rust", "Vue.js", "Angular", "Next.js", "Express.js",
            "Django", "Flask", "Spring Boot", "PostgreSQL", "MongoDB",
            "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP"
        ],
        "languages": [
            "JavaScript", "Python", "TypeScript", "Java", "Go", "Rust",
            "PHP", "C#", "C++", "Swift", "Kotlin", "Dart", "Ruby"
        ],
        "experience_levels": ["junior", "mid", "senior"],
        "documentation_quality": ["poor", "fair", "good", "excellent"],
        "testing_practices": ["poor", "fair", "good", "excellent"]
    }
    
    if q:
        # Filter suggestions based on query
        filtered = {}
        for category, items in suggestions.items():
            filtered[category] = [item for item in items if q.lower() in item.lower()]
        return filtered
    
    return suggestions

@router.post("/search/save")
async def save_search(
    criteria: SearchCriteria,
    name: str,
    alerts_enabled: bool = False,
    current_user: User = Depends(get_current_user)
):
    """Save a search for later use and optional alerts."""
    if current_user.user_type != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can save searches")
    
    try:
        search_id = await search_service.save_search(criteria, name, current_user.id, alerts_enabled)
        return {"search_id": search_id, "message": "Search saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save search: {str(e)}")

@router.get("/search/saved")
async def get_saved_searches(
    current_user: User = Depends(get_current_user)
):
    """Get all saved searches for the current recruiter."""
    if current_user.user_type != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can access saved searches")
    
    try:
        return await search_service.get_saved_searches(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve saved searches: {str(e)}")

@router.get("/search/examples")
async def get_search_examples():
    """Get example search queries to help recruiters understand capabilities."""
    return {
        "examples": [
            {
                "title": "Senior React Developer",
                "description": "Find experienced React developers with strong documentation",
                "criteria": {
                    "skills": ["React", "JavaScript", "TypeScript"],
                    "experience_level": "senior",
                    "documentation_quality": "good",
                    "min_github_score": 70
                }
            },
            {
                "title": "Full-Stack with Next.js",
                "description": "Developers with Next.js experience in original projects",
                "criteria": {
                    "skills": ["Next.js", "React", "Node.js"],
                    "exclude_forks": True,
                    "requires_original_projects": True,
                    "min_repositories": 5
                }
            },
            {
                "title": "Strong Documentation Practices",
                "description": "Developers who write excellent documentation",
                "criteria": {
                    "documentation_quality": "excellent",
                    "testing_practices": "good",
                    "min_github_score": 75
                }
            },
            {
                "title": "Python Data Science",
                "description": "Python developers with data science experience",
                "criteria": {
                    "primary_languages": ["Python"],
                    "skills": ["Python", "pandas", "numpy", "scikit-learn"],
                    "custom_query": "data science or machine learning projects"
                }
            }
        ]
    }
