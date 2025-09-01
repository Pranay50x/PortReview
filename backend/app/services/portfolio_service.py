from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.portfolio import (
    Portfolio, PortfolioCreate, PortfolioUpdate, PortfolioPublic, CandidateProfile,
    AIProfileAnalysis, AIGeneratedContent, CodeCraftsmanshipScore, RecruiterInsights
)
from app.services.ai_service import AIService
from app.services.github_service import GitHubService
from bson import ObjectId
from typing import Optional, List, Dict, Any
from datetime import datetime

class PortfolioService:
    def __init__(self, db):
        self.db = db
        self.collection = db.portfolios
        self.ai_service = AIService()
        self.github_service = GitHubService()
    
    async def create_portfolio(self, user_id: str, portfolio_data: PortfolioCreate) -> Portfolio:
        """
        Create a new portfolio and trigger AI analysis.
        """
        portfolio_doc = {
            "user_id": user_id,
            "title": portfolio_data.title,
            "description": portfolio_data.description,
            "skills": portfolio_data.skills,
            "github_username": portfolio_data.github_username,
            "resume_data": portfolio_data.resume_data,
            "is_public": portfolio_data.is_public,
            "github_repositories": [],
            "ai_profile_analysis": None,
            "ai_generated_content": None,
            "code_craftsmanship_score": None,
            "recruiter_insights": None,
            "view_count": 0,
            "last_github_sync": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(portfolio_doc)
        portfolio_id = str(result.inserted_id)
        
        # Trigger background AI analysis
        await self._perform_full_analysis(portfolio_id, portfolio_data.github_username, portfolio_data.resume_data)
        
        # Return the created portfolio
        updated_portfolio = await self.get_portfolio(portfolio_id)
        return updated_portfolio
    
    async def _perform_full_analysis(self, portfolio_id: str, github_username: str, resume_data: Dict[str, Any] = None):
        """
        Perform complete AI analysis pipeline for a portfolio.
        """
        try:
            # Step 1: Fetch GitHub repositories
            repositories = await self.github_service.get_user_repositories(github_username)
            
            # Step 2: AI-Powered Profile Analysis
            profile_analysis_data = await self.ai_service.analyze_profile(repositories, resume_data)
            
            # Step 3: Code Craftsmanship Score
            craftsmanship_data = await self.ai_service.calculate_craftsmanship_score(repositories)
            
            # Step 4: Automated Portfolio Generation
            portfolio_content_data = await self.ai_service.generate_portfolio_content(profile_analysis_data, repositories)
            
            # Step 5: Recruiter Insights
            recruiter_insights_data = await self.ai_service.generate_candidate_summary({
                "profile_analysis": profile_analysis_data,
                "craftsmanship_score": craftsmanship_data,
                "repositories": repositories,
                "resume_data": resume_data
            })
            
            # Step 6: Generate Interview Questions
            interview_questions = await self.ai_service.generate_interview_questions(repositories, profile_analysis_data)
            recruiter_insights_data["interview_questions"] = interview_questions
            
            # Update portfolio with all analysis results
            update_data = {
                "github_repositories": repositories,
                "ai_profile_analysis": profile_analysis_data,
                "ai_generated_content": portfolio_content_data,
                "code_craftsmanship_score": craftsmanship_data,
                "recruiter_insights": recruiter_insights_data,
                "last_github_sync": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await self.collection.update_one(
                {"_id": ObjectId(portfolio_id)},
                {"$set": update_data}
            )
            
        except Exception as e:
            # Log error but don't fail portfolio creation
            print(f"Analysis failed for portfolio {portfolio_id}: {str(e)}")
    
    async def get_portfolio(self, portfolio_id: str) -> Optional[Portfolio]:
        """Get portfolio by ID."""
        try:
            portfolio_doc = await self.collection.find_one({"_id": ObjectId(portfolio_id)})
            if portfolio_doc:
                portfolio_doc["id"] = str(portfolio_doc["_id"])
                return Portfolio(**portfolio_doc)
        except Exception:
            pass
        return None
    
    async def get_portfolio_public(self, portfolio_id: str) -> Optional[PortfolioPublic]:
        """Get public portfolio view (developer-facing)."""
        portfolio = await self.get_portfolio(portfolio_id)
        if portfolio and portfolio.is_public:
            return PortfolioPublic(
                id=portfolio.id,
                title=portfolio.title,
                description=portfolio.description,
                skills=portfolio.skills,
                github_username=portfolio.github_username,
                github_repositories=portfolio.github_repositories,
                ai_generated_content=portfolio.ai_generated_content,
                code_craftsmanship_score=portfolio.code_craftsmanship_score,
                view_count=portfolio.view_count,
                created_at=portfolio.created_at,
                updated_at=portfolio.updated_at
            )
        return None
    
    async def get_candidate_profile(self, portfolio_id: str) -> Optional[CandidateProfile]:
        """Get candidate profile (recruiter-facing view)."""
        portfolio = await self.get_portfolio(portfolio_id)
        if portfolio and portfolio.is_public:
            return CandidateProfile(
                id=portfolio.id,
                title=portfolio.title,
                description=portfolio.description,
                skills=portfolio.skills,
                github_username=portfolio.github_username,
                resume_data=portfolio.resume_data,
                ai_profile_analysis=portfolio.ai_profile_analysis,
                code_craftsmanship_score=portfolio.code_craftsmanship_score,
                recruiter_insights=portfolio.recruiter_insights,
                github_repositories=portfolio.github_repositories,
                created_at=portfolio.created_at,
                updated_at=portfolio.updated_at
            )
        return None
    
    async def get_user_portfolios(self, user_id: str, skip: int = 0, limit: int = 20) -> List[Portfolio]:
        """Get portfolios for a specific user."""
        cursor = self.collection.find({"user_id": user_id}).skip(skip).limit(limit)
        portfolios = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            portfolios.append(Portfolio(**doc))
        return portfolios
    
    async def update_portfolio(self, portfolio_id: str, user_id: str, update_data: PortfolioUpdate) -> Optional[Portfolio]:
        """Update portfolio and re-run analysis if needed."""
        update_dict = {k: v for k, v in update_data.dict(exclude_none=True).items()}
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.update_one(
            {"_id": ObjectId(portfolio_id), "user_id": user_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            # If GitHub username changed, re-run analysis
            if "github_username" in update_dict:
                portfolio = await self.get_portfolio(portfolio_id)
                if portfolio:
                    await self._perform_full_analysis(portfolio_id, portfolio.github_username, portfolio.resume_data)
            
            return await self.get_portfolio(portfolio_id)
        return None
    
    async def delete_portfolio(self, portfolio_id: str, user_id: str) -> bool:
        """Delete a portfolio."""
        result = await self.collection.delete_one(
            {"_id": ObjectId(portfolio_id), "user_id": user_id}
        )
        return result.deleted_count > 0
    
    async def increment_view_count(self, portfolio_id: str):
        """Increment portfolio view count."""
        await self.collection.update_one(
            {"_id": ObjectId(portfolio_id)},
            {"$inc": {"view_count": 1}}
        )
    
    async def sync_github_data(self, portfolio_id: str) -> Optional[Portfolio]:
        """Re-sync GitHub data and re-run analysis."""
        portfolio = await self.get_portfolio(portfolio_id)
        if portfolio:
            await self._perform_full_analysis(portfolio_id, portfolio.github_username, portfolio.resume_data)
            return await self.get_portfolio(portfolio_id)
        return None
    
    async def get_public_portfolios(self, skip: int = 0, limit: int = 20, skills: List[str] = None) -> List[PortfolioPublic]:
        """Get public portfolios with optional skill filtering."""
        query = {"is_public": True}
        if skills:
            query["skills"] = {"$in": skills}
        
        cursor = self.collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
        portfolios = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            portfolio = Portfolio(**doc)
            portfolios.append(PortfolioPublic(
                id=portfolio.id,
                title=portfolio.title,
                description=portfolio.description,
                skills=portfolio.skills,
                github_username=portfolio.github_username,
                github_repositories=portfolio.github_repositories,
                ai_generated_content=portfolio.ai_generated_content,
                code_craftsmanship_score=portfolio.code_craftsmanship_score,
                view_count=portfolio.view_count,
                created_at=portfolio.created_at,
                updated_at=portfolio.updated_at
            ))
        return portfolios
        """
        Get portfolios for a specific user.
        """
        cursor = self.collection.find({"user_id": user_id}).skip(skip).limit(limit)
        portfolios = []
        
        async for portfolio_doc in cursor:
            portfolios.append(Portfolio(**portfolio_doc, id=portfolio_doc["_id"]))
        
        return portfolios
    
    async def search_portfolios(
        self, 
        search: Optional[str] = None,
        skills: Optional[List[str]] = None,
        experience_level: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[PortfolioPublic]:
        """
        Search public portfolios with filters.
        """
        query = {"is_public": True}
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"skills": {"$regex": search, "$options": "i"}}
            ]
        
        if skills:
            query["skills"] = {"$in": skills}
        
        if experience_level:
            query["experience_level"] = experience_level
        
        cursor = self.collection.find(query).skip(skip).limit(limit)
        portfolios = []
        
        async for portfolio_doc in cursor:
            # Convert to public portfolio (exclude sensitive data)
            public_portfolio = PortfolioPublic(**portfolio_doc, id=portfolio_doc["_id"])
            portfolios.append(public_portfolio)
        
        return portfolios
    
    async def update_portfolio(self, portfolio_id: ObjectId, portfolio_update: PortfolioUpdate) -> Optional[Portfolio]:
        """
        Update portfolio.
        """
        update_data = portfolio_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.update_one(
            {"_id": portfolio_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return await self.get_portfolio(portfolio_id)
        return None
    
    async def delete_portfolio(self, portfolio_id: ObjectId) -> bool:
        """
        Delete portfolio.
        """
        result = await self.collection.delete_one({"_id": portfolio_id})
        return result.deleted_count > 0
    
    async def get_portfolio_stats(self, portfolio_id: ObjectId) -> dict:
        """
        Get portfolio statistics.
        """
        # This would typically aggregate data from reviews, views, etc.
        # For now, return basic stats
        return {
            "views": 0,
            "reviews": 0,
            "average_rating": 0.0,
            "last_updated": datetime.utcnow()
        }
