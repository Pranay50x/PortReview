from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from app.core.database import get_database
import json
import logging

logger = logging.getLogger(__name__)

class CacheService:
    """Service for caching AI analysis results to avoid repeated API calls."""
    
    def __init__(self):
        self.cache_duration = timedelta(hours=6)  # Cache for 6 hours
    
    async def get_analysis_cache(self, username: str) -> Optional[Dict[str, Any]]:
        """Get cached analysis result for a username."""
        try:
            database = await get_database()
            if database is None:
                return None
            
            # Find cached analysis
            cache_entry = await database.github_cache.find_one({"username": username})
            
            if cache_entry:
                # Check if cache is still valid
                last_updated = cache_entry.get("last_updated")
                if last_updated and datetime.utcnow() - last_updated < self.cache_duration:
                    logger.info(f"Cache hit for username: {username}")
                    # Remove MongoDB-specific fields
                    result = {k: v for k, v in cache_entry.items() if k not in ["_id", "username", "last_updated"]}
                    return result
                else:
                    # Cache expired, remove it
                    await database.github_cache.delete_one({"username": username})
                    logger.info(f"Cache expired for username: {username}")
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting cache for {username}: {e}")
            return None
    
    async def save_analysis_cache(self, username: str, analysis_data: Dict[str, Any]) -> bool:
        """Save analysis result to cache."""
        try:
            database = await get_database()
            if database is None:
                return False
            
            cache_entry = {
                "username": username,
                "last_updated": datetime.utcnow(),
                **analysis_data
            }
            
            # Upsert the cache entry
            await database.github_cache.replace_one(
                {"username": username},
                cache_entry,
                upsert=True
            )
            
            logger.info(f"Cache saved for username: {username}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving cache for {username}: {e}")
            return False
    
    async def clear_user_cache(self, username: str) -> bool:
        """Clear cache for a specific user."""
        try:
            database = await get_database()
            if database is None:
                return False
            
            await database.github_cache.delete_one({"username": username})
            logger.info(f"Cache cleared for username: {username}")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing cache for {username}: {e}")
            return False
    
    async def clear_expired_cache(self) -> int:
        """Clear all expired cache entries. Returns number of deleted entries."""
        try:
            database = await get_database()
            if database is None:
                return 0
            
            cutoff_time = datetime.utcnow() - self.cache_duration
            result = await database.github_cache.delete_many({
                "last_updated": {"$lt": cutoff_time}
            })
            
            deleted_count = result.deleted_count
            logger.info(f"Cleared {deleted_count} expired cache entries")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error clearing expired cache: {e}")
            return 0

cache_service = CacheService()
