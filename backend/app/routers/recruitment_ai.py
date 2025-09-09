from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from pydantic import BaseModel
import asyncio
from app.services.langchain_ai_service import langchain_ai
from app.core.database import get_database

router = APIRouter(prefix="/api/recruitment", tags=["recruitment-ai"])

class CandidateAnalysisRequest(BaseModel):
    github_username: str
    resume_text: str = None
    portfolio_data: Dict[str, Any] = None
    skills: List[str] = []

class TalentPoolRequest(BaseModel):
    role: str
    skills: List[str]
    experience: str
    location: str

class InterviewKitRequest(BaseModel):
    candidate_profile: Dict[str, Any]
    job_requirements: Dict[str, Any]

class JobDescriptionRequest(BaseModel):
    role: str
    company: str
    skills: List[str]
    experience: str
    location: str

class HiringPredictionRequest(BaseModel):
    candidate_data: Dict[str, Any]
    role_requirements: Dict[str, Any]

@router.post("/analyze-candidate")
async def analyze_candidate_profile(request: CandidateAnalysisRequest, db = Depends(get_database)):
    """
    Analyze candidate profile using LangChain AI
    Provides comprehensive technical and cultural fit assessment
    """
    try:
        # Fetch additional data from GitHub if needed
        github_data = {}
        if request.github_username:
            # Here you could fetch real GitHub data via GitHub API
            # For now, we'll use the provided data
            github_data = {"username": request.github_username}
        
        candidate_data = {
            "github_data": github_data,
            "portfolio_data": request.portfolio_data or {},
            "skills": request.skills,
            "resume_text": request.resume_text
        }
        
        analysis = await langchain_ai.analyze_candidate_profile(candidate_data)
        
        # Store analysis in database for future reference
        analysis_record = {
            "github_username": request.github_username,
            "analysis": analysis,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        await db.candidate_analyses.insert_one(analysis_record)
        
        return {
            "success": True,
            "analysis": analysis,
            "message": "Candidate analysis completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/talent-pool-insights")
async def generate_talent_pool_insights(request: TalentPoolRequest):
    """
    Generate market insights and talent pool analysis
    Provides current market trends and hiring recommendations
    """
    try:
        requirements = {
            "role": request.role,
            "skills": request.skills,
            "experience": request.experience,
            "location": request.location
        }
        
        insights = await langchain_ai.generate_talent_pool_insights(requirements)
        
        return {
            "success": True,
            "insights": insights,
            "message": "Talent pool insights generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")

@router.post("/interview-kit")
async def create_interview_kit(request: InterviewKitRequest):
    """
    Generate comprehensive interview kit using AI
    Creates technical, behavioral questions and coding challenges
    """
    try:
        interview_kit = await langchain_ai.create_interview_kit(
            request.candidate_profile, 
            request.job_requirements
        )
        
        return {
            "success": True,
            "interview_kit": interview_kit,
            "message": "Interview kit generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview kit generation failed: {str(e)}")

@router.post("/job-description")
async def generate_job_description(request: JobDescriptionRequest):
    """
    Generate optimized job description using AI
    Creates compelling, SEO-friendly job postings
    """
    try:
        requirements = {
            "role": request.role,
            "company": request.company,
            "skills": request.skills,
            "experience": request.experience,
            "location": request.location
        }
        
        job_description = await langchain_ai.generate_job_description(requirements)
        
        return {
            "success": True,
            "job_description": job_description,
            "message": "Job description generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job description generation failed: {str(e)}")

@router.post("/predict-hiring-success")
async def predict_hiring_success(request: HiringPredictionRequest):
    """
    Predict hiring success probability using AI
    Analyzes candidate fit and provides recommendations
    """
    try:
        prediction = await langchain_ai.predict_hiring_success(
            request.candidate_data,
            request.role_requirements
        )
        
        return {
            "success": True,
            "prediction": prediction,
            "message": "Hiring success prediction completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/candidate-analytics/{github_username}")
async def get_candidate_analytics(github_username: str, db = Depends(get_database)):
    """
    Get stored candidate analytics and insights
    """
    try:
        # Fetch from database
        analysis = await db.candidate_analyses.find_one(
            {"github_username": github_username},
            sort=[("timestamp", -1)]  # Get most recent
        )
        
        if not analysis:
            raise HTTPException(status_code=404, detail="No analysis found for this candidate")
        
        return {
            "success": True,
            "analysis": analysis["analysis"],
            "timestamp": analysis["timestamp"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

@router.get("/market-trends")
async def get_market_trends():
    """
    Get current market trends and insights
    """
    try:
        # Generate general market insights
        default_requirements = {
            "role": "Software Developer",
            "skills": ["JavaScript", "Python", "React", "Node.js"],
            "experience": "Mid-Level",
            "location": "Remote"
        }
        
        trends = await langchain_ai.generate_talent_pool_insights(default_requirements)
        
        return {
            "success": True,
            "trends": trends,
            "message": "Market trends retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market trends: {str(e)}")

@router.post("/batch-candidate-analysis")
async def batch_analyze_candidates(
    candidates: List[CandidateAnalysisRequest], 
    db = Depends(get_database)
):
    """
    Analyze multiple candidates in batch
    Useful for bulk candidate processing
    """
    try:
        results = []
        
        for candidate in candidates:
            try:
                candidate_data = {
                    "github_data": {"username": candidate.github_username},
                    "portfolio_data": candidate.portfolio_data or {},
                    "skills": candidate.skills,
                    "resume_text": candidate.resume_text
                }
                
                analysis = await langchain_ai.analyze_candidate_profile(candidate_data)
                
                results.append({
                    "github_username": candidate.github_username,
                    "analysis": analysis,
                    "success": True
                })
                
                # Store in database
                analysis_record = {
                    "github_username": candidate.github_username,
                    "analysis": analysis,
                    "timestamp": asyncio.get_event_loop().time(),
                    "batch_analysis": True
                }
                await db.candidate_analyses.insert_one(analysis_record)
                
            except Exception as e:
                results.append({
                    "github_username": candidate.github_username,
                    "error": str(e),
                    "success": False
                })
        
        return {
            "success": True,
            "results": results,
            "total_processed": len(results),
            "successful": len([r for r in results if r["success"]]),
            "failed": len([r for r in results if not r["success"]])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for recruitment AI service"""
    try:
        # Test AI service
        test_data = {
            "github_data": {"test": True},
            "skills": ["Python", "JavaScript"],
            "portfolio_data": {}
        }
        
        # Quick test analysis
        await langchain_ai.analyze_candidate_profile(test_data)
        
        return {
            "status": "healthy",
            "ai_service": "operational",
            "langchain": "configured" if langchain_ai.llm else "fallback_mode"
        }
        
    except Exception as e:
        return {
            "status": "degraded",
            "ai_service": "limited",
            "error": str(e),
            "langchain": "fallback_mode"
        }
