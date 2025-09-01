from typing import List, Dict, Any, Optional
from app.models.search import SearchCriteria, SearchResult, SearchResponse
from app.models.portfolio import Portfolio, CandidateProfile
from app.core.database import get_database
import re
from datetime import datetime

class SearchService:
    def __init__(self):
        self.db = None
    
    async def initialize(self):
        """Initialize database connection."""
        self.db = await get_database()
    
    async def search_candidates(self, criteria: SearchCriteria, recruiter_id: str) -> SearchResponse:
        """
        Core Feature: Advanced Candidate Search
        Search candidates using nuanced criteria beyond simple keyword matching.
        """
        if not self.db:
            await self.initialize()
        
        start_time = datetime.utcnow()
        
        try:
            # Build MongoDB aggregation pipeline
            pipeline = self._build_search_pipeline(criteria)
            
            # Execute search
            cursor = self.db.portfolios.aggregate(pipeline)
            portfolios = await cursor.to_list(length=criteria.limit + criteria.offset)
            
            # Apply offset and limit
            portfolios_slice = portfolios[criteria.offset:criteria.offset + criteria.limit]
            
            # Convert to search results
            results = []
            for portfolio in portfolios_slice:
                result = await self._portfolio_to_search_result(portfolio, criteria)
                results.append(result)
            
            # Calculate search time
            end_time = datetime.utcnow()
            search_time_ms = int((end_time - start_time).total_seconds() * 1000)
            
            # Generate suggestions
            suggestions = self._generate_search_suggestions(criteria, results)
            
            return SearchResponse(
                results=results,
                total_count=len(portfolios),
                search_time_ms=search_time_ms,
                filters_applied=criteria.dict(exclude_none=True),
                suggestions=suggestions
            )
            
        except Exception as e:
            return SearchResponse(
                results=[],
                total_count=0,
                search_time_ms=0,
                filters_applied={},
                suggestions=[f"Search error: {str(e)}"]
            )
    
    def _build_search_pipeline(self, criteria: SearchCriteria) -> List[Dict[str, Any]]:
        """Build MongoDB aggregation pipeline for advanced search."""
        pipeline = []
        
        # Match stage for basic filtering
        match_conditions = {"is_public": True}
        
        # Skills filter
        if criteria.skills:
            match_conditions["skills"] = {"$in": criteria.skills}
        
        # GitHub-specific filters
        if criteria.min_github_score is not None:
            match_conditions["code_craftsmanship_score.overall_score"] = {"$gte": criteria.min_github_score}
        
        if criteria.primary_languages:
            match_conditions["ai_profile_analysis.most_active_languages.language"] = {"$in": criteria.primary_languages}
        
        if criteria.min_repositories is not None:
            match_conditions["$expr"] = {"$gte": [{"$size": "$github_repositories"}, criteria.min_repositories]}
        
        # Exclude forks if requested
        if criteria.exclude_forks:
            match_conditions["github_repositories.fork"] = {"$ne": True}
        
        # Documentation quality filter
        if criteria.documentation_quality:
            quality_score_map = {"poor": 0, "fair": 25, "good": 60, "excellent": 80}
            min_score = quality_score_map.get(criteria.documentation_quality, 0)
            match_conditions["code_craftsmanship_score.documentation_score"] = {"$gte": min_score}
        
        # Testing practices filter
        if criteria.testing_practices:
            quality_score_map = {"poor": 0, "fair": 25, "good": 60, "excellent": 80}
            min_score = quality_score_map.get(criteria.testing_practices, 0)
            match_conditions["code_craftsmanship_score.testing_score"] = {"$gte": min_score}
        
        # Custom query handling
        if criteria.custom_query:
            # Parse custom queries like "experience with Next.js in a non-forked project"
            custom_conditions = self._parse_custom_query(criteria.custom_query)
            match_conditions.update(custom_conditions)
        
        pipeline.append({"$match": match_conditions})
        
        # Add computed fields for scoring
        pipeline.append({
            "$addFields": {
                "match_score": {
                    "$divide": [
                        {
                            "$add": [
                                {"$ifNull": ["$code_craftsmanship_score.overall_score", 0]},
                                {"$multiply": [{"$size": {"$ifNull": ["$github_repositories", []]}}, 2]},
                                {"$multiply": [{"$size": {"$ifNull": ["$skills", []]}}, 3]}
                            ]
                        },
                        100
                    ]
                }
            }
        })
        
        # Sort stage
        if criteria.sort_by == "score":
            sort_field = "code_craftsmanship_score.overall_score"
        elif criteria.sort_by == "created_at":
            sort_field = "created_at"
        else:  # relevance
            sort_field = "match_score"
        
        sort_order = -1 if criteria.sort_order == "desc" else 1
        pipeline.append({"$sort": {sort_field: sort_order}})
        
        return pipeline
    
    def _parse_custom_query(self, query: str) -> Dict[str, Any]:
        """Parse custom search queries into MongoDB conditions."""
        conditions = {}
        query_lower = query.lower()
        
        # Example patterns to handle
        if "next.js" in query_lower and "non-forked" in query_lower:
            conditions.update({
                "$and": [
                    {"github_repositories.topics": {"$in": ["nextjs", "next.js", "react"]}},
                    {"github_repositories.fork": {"$ne": True}}
                ]
            })
        
        if "documentation" in query_lower and "strong" in query_lower:
            conditions["code_craftsmanship_score.documentation_score"] = {"$gte": 75}
        
        # Add more pattern matching as needed
        return conditions
    
    async def _portfolio_to_search_result(self, portfolio: Dict[str, Any], criteria: SearchCriteria) -> SearchResult:
        """Convert portfolio document to search result."""
        # Calculate match score based on criteria
        match_score = self._calculate_match_score(portfolio, criteria)
        
        # Generate highlight reasons
        highlight_reasons = self._generate_highlight_reasons(portfolio, criteria)
        
        # Extract candidate summary
        recruiter_insights = portfolio.get("recruiter_insights", {})
        summary = recruiter_insights.get("candidate_summary", "")
        if not summary:
            summary = portfolio.get("description", "")
        
        return SearchResult(
            candidate_id=str(portfolio["_id"]),
            title=portfolio.get("title", ""),
            github_username=portfolio.get("github_username", ""),
            skills=portfolio.get("skills", []),
            craftsmanship_score=portfolio.get("code_craftsmanship_score", {}).get("overall_score"),
            summary=summary[:200] + "..." if len(summary) > 200 else summary,
            match_score=match_score,
            highlight_reasons=highlight_reasons
        )
    
    def _calculate_match_score(self, portfolio: Dict[str, Any], criteria: SearchCriteria) -> float:
        """Calculate how well a candidate matches the search criteria."""
        score = 0.0
        factors = 0
        
        # Skills matching
        if criteria.skills:
            portfolio_skills = set(skill.lower() for skill in portfolio.get("skills", []))
            criteria_skills = set(skill.lower() for skill in criteria.skills)
            skill_match = len(portfolio_skills.intersection(criteria_skills)) / len(criteria_skills)
            score += skill_match * 0.3
            factors += 0.3
        
        # Language matching
        if criteria.primary_languages:
            portfolio_languages = []
            for lang_data in portfolio.get("ai_profile_analysis", {}).get("most_active_languages", []):
                portfolio_languages.append(lang_data.get("language", "").lower())
            criteria_languages = set(lang.lower() for lang in criteria.primary_languages)
            portfolio_lang_set = set(portfolio_languages)
            lang_match = len(portfolio_lang_set.intersection(criteria_languages)) / len(criteria_languages)
            score += lang_match * 0.25
            factors += 0.25
        
        # Craftsmanship score factor
        craftsmanship = portfolio.get("code_craftsmanship_score", {}).get("overall_score", 0)
        score += (craftsmanship / 100) * 0.25
        factors += 0.25
        
        # Repository activity factor
        repo_count = len(portfolio.get("github_repositories", []))
        repo_score = min(repo_count / 20, 1.0)  # Normalize to max 20 repos
        score += repo_score * 0.2
        factors += 0.2
        
        return min(score / factors if factors > 0 else 0.5, 1.0)
    
    def _generate_highlight_reasons(self, portfolio: Dict[str, Any], criteria: SearchCriteria) -> List[str]:
        """Generate reasons why this candidate matches the search."""
        reasons = []
        
        # Skills match
        if criteria.skills:
            portfolio_skills = set(skill.lower() for skill in portfolio.get("skills", []))
            criteria_skills = set(skill.lower() for skill in criteria.skills)
            matched_skills = portfolio_skills.intersection(criteria_skills)
            if matched_skills:
                reasons.append(f"Has {len(matched_skills)} matching skills: {', '.join(list(matched_skills)[:3])}")
        
        # High craftsmanship score
        craftsmanship = portfolio.get("code_craftsmanship_score", {}).get("overall_score", 0)
        if craftsmanship >= 80:
            reasons.append(f"High code craftsmanship score: {craftsmanship:.1f}/100")
        
        # Active repositories
        repo_count = len(portfolio.get("github_repositories", []))
        if repo_count >= 10:
            reasons.append(f"Active developer with {repo_count} repositories")
        
        # Documentation quality
        doc_score = portfolio.get("code_craftsmanship_score", {}).get("documentation_score", 0)
        if doc_score >= 75:
            reasons.append("Strong documentation practices")
        
        # Experience level
        experience = portfolio.get("ai_profile_analysis", {}).get("experience_level", "")
        if experience and criteria.experience_level and experience.lower() == criteria.experience_level.lower():
            reasons.append(f"Matches {experience} experience level")
        
        return reasons[:4]  # Limit to top 4 reasons
    
    def _generate_search_suggestions(self, criteria: SearchCriteria, results: List[SearchResult]) -> List[str]:
        """Generate search suggestions based on criteria and results."""
        suggestions = []
        
        if len(results) == 0:
            suggestions.append("Try broadening your search criteria")
            suggestions.append("Consider removing some skill requirements")
            if criteria.min_github_score and criteria.min_github_score > 70:
                suggestions.append("Lower the minimum GitHub score requirement")
        
        elif len(results) > 50:
            suggestions.append("Try adding more specific skills to narrow results")
            suggestions.append("Consider adding experience level filter")
            suggestions.append("Add minimum repository or documentation requirements")
        
        # Suggest popular skills if none specified
        if not criteria.skills:
            suggestions.append("Try searching for specific skills like 'React', 'Python', or 'Node.js'")
        
        return suggestions[:3]
    
    async def save_search(self, criteria: SearchCriteria, name: str, recruiter_id: str, alerts_enabled: bool = False) -> str:
        """Save a search for later use."""
        if not self.db:
            await self.initialize()
        
        saved_search = {
            "name": name,
            "criteria": criteria.dict(),
            "recruiter_id": recruiter_id,
            "alerts_enabled": alerts_enabled,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db.saved_searches.insert_one(saved_search)
        return str(result.inserted_id)
    
    async def get_saved_searches(self, recruiter_id: str) -> List[Dict[str, Any]]:
        """Get all saved searches for a recruiter."""
        if not self.db:
            await self.initialize()
        
        cursor = self.db.saved_searches.find({"recruiter_id": recruiter_id})
        return await cursor.to_list(length=100)
