from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class SearchCriteria(BaseModel):
    """Advanced candidate search criteria model."""
    # Basic filters
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = None  # junior, mid, senior
    location: Optional[str] = None
    
    # GitHub-specific filters
    min_github_score: Optional[float] = None  # Minimum craftsmanship score
    primary_languages: Optional[List[str]] = None
    min_repositories: Optional[int] = None
    exclude_forks: bool = True
    requires_original_projects: bool = True
    
    # Advanced criteria
    documentation_quality: Optional[str] = None  # poor, fair, good, excellent
    testing_practices: Optional[str] = None  # poor, fair, good, excellent
    project_complexity: Optional[str] = None  # simple, moderate, complex
    collaboration_experience: Optional[bool] = None  # has collaborated on projects
    
    # Custom search queries
    custom_query: Optional[str] = None  # e.g., "experience with Next.js in a non-forked project"
    
    # Results configuration
    limit: int = Field(default=20, le=100)
    offset: int = Field(default=0, ge=0)
    sort_by: str = Field(default="relevance")  # relevance, score, created_at
    sort_order: str = Field(default="desc")  # asc, desc

class SearchResult(BaseModel):
    """Individual search result model."""
    candidate_id: str
    title: str
    github_username: str
    skills: List[str]
    craftsmanship_score: Optional[float] = None
    summary: str
    match_score: float = Field(..., ge=0, le=1, description="How well they match the search criteria")
    highlight_reasons: List[str] = Field(default_factory=list, description="Why this candidate matches")
    
class SearchResponse(BaseModel):
    """Search response model."""
    results: List[SearchResult]
    total_count: int
    search_time_ms: int
    filters_applied: Dict[str, Any]
    suggestions: List[str] = Field(default_factory=list, description="Search suggestions")
    
class SavedSearch(BaseModel):
    """Saved search model for recruiters."""
    id: str
    name: str
    criteria: SearchCriteria
    recruiter_id: str
    alerts_enabled: bool = False
    created_at: datetime
    updated_at: datetime

class SearchAlert(BaseModel):
    """Search alert model."""
    id: str
    saved_search_id: str
    recruiter_id: str
    new_candidates_count: int
    last_triggered: datetime
    is_active: bool = True
