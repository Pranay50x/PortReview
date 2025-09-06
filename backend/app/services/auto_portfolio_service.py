"""
Enhanced Auto-Portfolio Service
Implements core USPs: One-click GitHub portfolio generation with AI insights
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.github_service import GitHubService
from app.services.ai_service import AIService
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone
import asyncio
from bson import ObjectId

class AutoPortfolioService:
    def __init__(self, db):
        self.db = db
        self.portfolios_collection = db.portfolios
        self.github_service = GitHubService()
        self.ai_service = AIService()
    
    async def create_auto_portfolio_from_github(self, user_id: str, github_username: str) -> Dict[str, Any]:
        """
        USP #1: One-Click GitHub Portfolio Auto-Generation
        Creates a complete portfolio automatically from GitHub data alone.
        """
        try:
            # Step 1: Extract comprehensive GitHub data
            github_data = await self._extract_comprehensive_github_data(github_username)
            
            # Step 2: Generate AI insights
            ai_insights = await self._generate_comprehensive_ai_insights(github_data)
            
            # Step 3: Create auto-generated portfolio
            portfolio = await self._create_auto_portfolio(user_id, github_username, github_data, ai_insights)
            
            return {
                "success": True,
                "portfolio_id": portfolio["id"],
                "portfolio_url": f"/portfolio/{portfolio['id']}",
                "auto_generated_content": ai_insights.get("portfolio_content", {}),
                "craftsmanship_score": ai_insights.get("craftsmanship_score", {}),
                "message": "Portfolio auto-generated successfully from GitHub data!"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Auto-portfolio generation failed: {str(e)}",
                "suggestion": "Please check if the GitHub username is correct and the profile is public."
            }
    
    async def _extract_comprehensive_github_data(self, username: str) -> Dict[str, Any]:
        """
        Extract comprehensive data from GitHub for portfolio generation.
        """
        # Get user profile
        user_data = await self.github_service.get_user_data_public(username)
        
        # Get repositories with enhanced analysis
        repositories = await self.github_service.get_user_repositories(username)
        
        # Get activity statistics
        activity_stats = await self.github_service.get_user_activity_stats(username)
        
        # Analyze repository patterns
        repo_analysis = await self._analyze_repository_patterns(repositories)
        
        # Extract skill progression
        skill_progression = await self._extract_skill_progression(repositories)
        
        return {
            "user_profile": user_data,
            "repositories": repositories,
            "activity_stats": activity_stats,
            "repository_analysis": repo_analysis,
            "skill_progression": skill_progression,
            "extracted_at": datetime.now(timezone.utc)
        }
    
    async def _analyze_repository_patterns(self, repositories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        USP #3: Smart Project Impact Analysis
        Analyzes patterns in repositories to assess real impact and quality.
        """
        if not repositories:
            return {"error": "No repositories found"}
        
        # Calculate impact metrics
        total_stars = sum(repo.get("stargazers_count", 0) for repo in repositories)
        total_forks = sum(repo.get("forks_count", 0) for repo in repositories)
        
        # Find high-impact projects
        high_impact_projects = [
            repo for repo in repositories 
            if repo.get("stargazers_count", 0) > 10 or repo.get("forks_count", 0) > 5
        ]
        
        # Analyze project complexity
        languages_per_project = {}
        for repo in repositories:
            if repo.get("language"):
                project_name = repo["name"]
                languages_per_project[project_name] = repo["language"]
        
        # Recent activity analysis
        six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
        recent_projects = []
        
        for repo in repositories:
            if repo.get("updated_at"):
                try:
                    updated_date = datetime.fromisoformat(repo["updated_at"].replace("Z", "+00:00"))
                    if updated_date > six_months_ago:
                        recent_projects.append(repo)
                except Exception as e:
                    # Skip repos with invalid dates
                    continue
        
        # Project quality indicators
        quality_indicators = {
            "repos_with_readme": len([r for r in repositories if r.get("has_readme", False)]),
            "repos_with_license": len([r for r in repositories if r.get("license")]),
            "repos_with_description": len([r for r in repositories if r.get("description")]),
            "repos_with_topics": len([r for r in repositories if r.get("topics")])
        }
        
        return {
            "total_impact": {
                "stars": total_stars,
                "forks": total_forks,
                "repositories": len(repositories)
            },
            "high_impact_projects": high_impact_projects[:10],
            "recent_activity": {
                "active_projects_6m": len(recent_projects),
                "most_recent_projects": recent_projects[:5]
            },
            "quality_indicators": quality_indicators,
            "languages_distribution": languages_per_project,
            "project_diversity": len(set(repo.get("language") for repo in repositories if repo.get("language")))
        }
    
    async def _extract_skill_progression(self, repositories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        USP #5: Developer Skill Trajectory Mapping
        Extracts skill evolution over time from repository data.
        """
        if not repositories:
            return {"error": "No repositories for skill analysis"}
        
        # Group repositories by year
        repos_by_year = {}
        languages_by_year = {}
        
        for repo in repositories:
            if repo.get("created_at"):
                try:
                    created_date = datetime.fromisoformat(repo["created_at"].replace("Z", "+00:00"))
                    year = created_date.year
                    
                    if year not in repos_by_year:
                        repos_by_year[year] = []
                        languages_by_year[year] = {}
                    
                    repos_by_year[year].append(repo)
                    
                    if repo.get("language"):
                        lang = repo["language"]
                        languages_by_year[year][lang] = languages_by_year[year].get(lang, 0) + 1
                        
                except Exception as e:
                    # Skip repos with invalid dates
                    continue
        
        # Calculate skill progression
        skill_timeline = []
        for year in sorted(repos_by_year.keys()):
            year_data = {
                "year": year,
                "repositories_created": len(repos_by_year[year]),
                "top_languages": sorted(
                    languages_by_year[year].items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )[:5],
                "notable_projects": [
                    repo for repo in repos_by_year[year]
                    if repo.get("stargazers_count", 0) > 0 or repo.get("description")
                ][:3]
            }
            skill_timeline.append(year_data)
        
        # Extract current skill stack
        recent_languages = {}
        for repo in repositories[:20]:  # Last 20 repos
            if repo.get("language"):
                lang = repo["language"]
                recent_languages[lang] = recent_languages.get(lang, 0) + 1
        
        current_stack = sorted(recent_languages.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "skill_timeline": skill_timeline,
            "current_primary_stack": current_stack,
            "years_coding": len(repos_by_year),
            "skill_diversity": len(set(lang for year_langs in languages_by_year.values() for lang in year_langs.keys())),
            "learning_pattern": "continuous" if len(repos_by_year) > 1 else "recent_starter"
        }
    
    async def _generate_comprehensive_ai_insights(self, github_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate all AI insights for the portfolio.
        """
        repositories = github_data.get("repositories", [])
        user_profile = github_data.get("user_profile", {})
        
        # Run AI analysis in parallel for efficiency
        tasks = [
            self.ai_service.analyze_profile(repositories, user_profile),
            self.ai_service.calculate_craftsmanship_score(repositories),
            self.ai_service.generate_portfolio_content(github_data, repositories),
            self.ai_service.generate_interview_questions(repositories, github_data)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            "profile_analysis": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "craftsmanship_score": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "portfolio_content": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
            "interview_questions": results[3] if not isinstance(results[3], Exception) else []
        }
    
    async def _create_auto_portfolio(
        self, 
        user_id: str, 
        github_username: str, 
        github_data: Dict[str, Any], 
        ai_insights: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create the auto-generated portfolio document.
        """
        user_profile = github_data.get("user_profile", {})
        portfolio_content = ai_insights.get("portfolio_content", {})
        
        # Generate portfolio title from AI content or user data
        title = (
            portfolio_content.get("suggested_title") or 
            f"{user_profile.get('name', github_username)}'s Portfolio" or
            f"{github_username} - Developer Portfolio"
        )
        
        # Generate description from AI bio or GitHub bio
        description = (
            portfolio_content.get("bio") or 
            user_profile.get("bio") or
            f"Showcasing the work and projects of {github_username}"
        )
        
        # Extract skills from analysis
        skills = []
        if "profile_analysis" in ai_insights and "technical_skills" in ai_insights["profile_analysis"]:
            skills = list(ai_insights["profile_analysis"]["technical_skills"].keys())
        elif "activity_stats" in github_data and "top_languages" in github_data["activity_stats"]:
            skills = [lang["language"] for lang in github_data["activity_stats"]["top_languages"][:10]]
        
        portfolio_doc = {
            "user_id": user_id,
            "title": title,
            "description": description,
            "skills": skills,
            "github_username": github_username,
            "is_public": True,  # Auto-generated portfolios are public by default
            "auto_generated": True,
            "github_data": github_data,
            "ai_insights": ai_insights,
            "view_count": 0,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "last_github_sync": datetime.now(timezone.utc)
        }
        
        result = await self.portfolios_collection.insert_one(portfolio_doc)
        portfolio_doc["id"] = str(result.inserted_id)
        
        return portfolio_doc
    
    async def refresh_portfolio_from_github(self, portfolio_id: str) -> Dict[str, Any]:
        """
        Refresh an existing portfolio with latest GitHub data.
        """
        try:
            portfolio = await self.portfolios_collection.find_one({"_id": ObjectId(portfolio_id)})
            if not portfolio:
                return {"success": False, "error": "Portfolio not found"}
            
            github_username = portfolio.get("github_username")
            if not github_username:
                return {"success": False, "error": "No GitHub username associated with portfolio"}
            
            # Re-extract data and regenerate insights
            github_data = await self._extract_comprehensive_github_data(github_username)
            ai_insights = await self._generate_comprehensive_ai_insights(github_data)
            
            # Update portfolio
            update_data = {
                "github_data": github_data,
                "ai_insights": ai_insights,
                "updated_at": datetime.now(timezone.utc),
                "last_github_sync": datetime.now(timezone.utc)
            }
            
            await self.portfolios_collection.update_one(
                {"_id": ObjectId(portfolio_id)},
                {"$set": update_data}
            )
            
            return {
                "success": True,
                "message": "Portfolio refreshed with latest GitHub data",
                "updated_at": update_data["updated_at"]
            }
            
        except Exception as e:
            return {"success": False, "error": f"Portfolio refresh failed: {str(e)}"}
    
    async def get_portfolio_insights(self, portfolio_id: str) -> Dict[str, Any]:
        """
        Get comprehensive insights for a portfolio (for both developers and recruiters).
        """
        try:
            portfolio = await self.portfolios_collection.find_one({"_id": ObjectId(portfolio_id)})
            if not portfolio:
                return {"error": "Portfolio not found"}
            
            ai_insights = portfolio.get("ai_insights", {})
            github_data = portfolio.get("github_data", {})
            
            return {
                "portfolio_id": portfolio_id,
                "basic_info": {
                    "title": portfolio.get("title"),
                    "description": portfolio.get("description"),
                    "skills": portfolio.get("skills", []),
                    "github_username": portfolio.get("github_username"),
                    "created_at": portfolio.get("created_at"),
                    "view_count": portfolio.get("view_count", 0)
                },
                "craftsmanship_score": ai_insights.get("craftsmanship_score", {}),
                "profile_analysis": ai_insights.get("profile_analysis", {}),
                "portfolio_content": ai_insights.get("portfolio_content", {}),
                "interview_questions": ai_insights.get("interview_questions", []),
                "github_stats": github_data.get("activity_stats", {}),
                "project_analysis": github_data.get("repository_analysis", {}),
                "skill_progression": github_data.get("skill_progression", {}),
                "last_updated": portfolio.get("last_github_sync")
            }
            
        except Exception as e:
            return {"error": f"Failed to get portfolio insights: {str(e)}"}
