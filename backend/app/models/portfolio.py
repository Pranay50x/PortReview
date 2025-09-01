from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime
from bson import ObjectId

class GitHubRepository(BaseModel):
    """GitHub repository model."""
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    clone_url: str
    language: Optional[str] = None
    stargazers_count: int = 0
    watchers_count: int = 0
    forks_count: int = 0
    open_issues_count: int = 0
    size: int = 0
    topics: List[str] = []
    created_at: str
    updated_at: str
    pushed_at: Optional[str] = None
    license: Optional[Dict[str, Any]] = None
    has_readme: bool = False
    has_wiki: bool = False
    has_pages: bool = False
    archived: bool = False
    disabled: bool = False
    private: bool = False
    fork: bool = False

class CodeCraftsmanshipScore(BaseModel):
    """Code Craftsmanship Score model."""
    overall_score: float = Field(..., ge=0, le=100, description="Overall craftsmanship score (0-100)")
    code_quality_score: float = Field(..., ge=0, le=100, description="Code quality and structure")
    documentation_score: float = Field(..., ge=0, le=100, description="Documentation and README quality")
    testing_score: float = Field(..., ge=0, le=100, description="Testing practices and coverage")
    project_structure_score: float = Field(..., ge=0, le=100, description="Project organization and architecture")
    
    # Detailed breakdowns
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Detailed metrics")
    strengths: List[str] = Field(default_factory=list, description="Identified strengths")
    improvement_areas: List[str] = Field(default_factory=list, description="Areas for improvement")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations")
    
    # Analysis metadata
    analyzed_repositories: int = Field(default=0, description="Number of repositories analyzed")
    analysis_date: datetime = Field(default_factory=datetime.utcnow)

class AIProfileAnalysis(BaseModel):
    """AI-powered profile analysis model."""
    technical_skills: Dict[str, float] = Field(default_factory=dict, description="Skills with confidence scores")
    most_active_languages: List[Dict[str, Any]] = Field(default_factory=list, description="Languages with usage stats")
    project_quality_assessment: Dict[str, Any] = Field(default_factory=dict, description="Overall project quality")
    experience_level: str = Field(default="", description="Estimated experience level")
    specializations: List[str] = Field(default_factory=list, description="Identified specializations")
    collaboration_patterns: Dict[str, Any] = Field(default_factory=dict, description="How they work with others")
    code_patterns: Dict[str, Any] = Field(default_factory=dict, description="Coding style and patterns")
    analysis_confidence: float = Field(default=0.0, ge=0, le=1, description="Confidence in analysis")

class AIGeneratedContent(BaseModel):
    """AI-generated portfolio content model."""
    bio: str = Field(default="", description="AI-generated personal bio")
    project_descriptions: Dict[str, str] = Field(default_factory=dict, description="AI-written project descriptions")
    skills_summary: str = Field(default="", description="AI-generated skills summary")
    professional_summary: str = Field(default="", description="AI-generated professional summary")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class RecruiterInsights(BaseModel):
    """Recruiter-facing candidate insights model."""
    candidate_summary: str = Field(default="", description="AI-generated candidate summary")
    core_strengths: List[str] = Field(default_factory=list, description="Key strengths")
    impressive_projects: List[Dict[str, Any]] = Field(default_factory=list, description="Most impressive projects")
    potential_red_flags: List[str] = Field(default_factory=list, description="Areas of concern")
    interview_questions: List[str] = Field(default_factory=list, description="Contextual interview questions")
    fit_analysis: Dict[str, Any] = Field(default_factory=dict, description="Role fit analysis")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class PortfolioBase(BaseModel):
    """Base portfolio model."""
    title: str
    description: str
    skills: List[str] = []
    github_username: str
    resume_data: Optional[Dict[str, Any]] = None
    is_public: bool = True

class PortfolioCreate(PortfolioBase):
    """Portfolio creation model."""
    pass

class PortfolioUpdate(BaseModel):
    """Portfolio update model."""
    title: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    resume_data: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class Portfolio(PortfolioBase):
    """Full portfolio model."""
    id: str
    user_id: str
    github_repositories: List[GitHubRepository] = []
    
    # Core feature data
    ai_profile_analysis: Optional[AIProfileAnalysis] = None
    ai_generated_content: Optional[AIGeneratedContent] = None
    code_craftsmanship_score: Optional[CodeCraftsmanshipScore] = None
    recruiter_insights: Optional[RecruiterInsights] = None
    
    # Portfolio metadata
    view_count: int = 0
    last_github_sync: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class PortfolioPublic(BaseModel):
    """Public portfolio model (developer-facing view)."""
    id: str
    title: str
    description: str
    skills: List[str] = []
    github_username: str
    github_repositories: List[GitHubRepository] = []
    ai_generated_content: Optional[AIGeneratedContent] = None
    code_craftsmanship_score: Optional[CodeCraftsmanshipScore] = None
    view_count: int = 0
    created_at: datetime
    updated_at: datetime

class CandidateProfile(BaseModel):
    """Recruiter-facing candidate profile model."""
    id: str
    title: str
    description: str
    skills: List[str] = []
    github_username: str
    resume_data: Optional[Dict[str, Any]] = None
    ai_profile_analysis: Optional[AIProfileAnalysis] = None
    code_craftsmanship_score: Optional[CodeCraftsmanshipScore] = None
    recruiter_insights: Optional[RecruiterInsights] = None
    github_repositories: List[GitHubRepository] = []
    created_at: datetime
    updated_at: datetime
