from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db = Database()

async def get_database():
    """Get database instance."""
    return db.database

async def init_db():
    """Initialize database connection and create indexes."""
    try:
        # Create MongoDB client with SSL options
        db.client = AsyncIOMotorClient(
            settings.mongodb_url,
            ssl=True,
            ssl_cert_reqs='CERT_NONE',  # For development - allows self-signed certificates
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        db.database = db.client[settings.database_name]
        
        # Test connection
        await db.client.admin.command('ping')
        logger.info("Connected to MongoDB successfully!")
        
        # Create indexes
        await create_indexes()
        logger.info("Database indexes created successfully!")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # For development, we'll continue without MongoDB and use in-memory storage
        logger.warning("Continuing without MongoDB - using in-memory storage for development")
        db.client = None
        db.database = None

async def close_db():
    """Close database connection."""
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")

async def create_indexes():
    """Create database indexes for optimal performance."""
    database = await get_database()
    
    try:
        # User collection indexes
        await database.users.create_index("email", unique=True)
        await database.users.create_index("github_username")
        await database.users.create_index("user_type")
        await database.users.create_index([("created_at", -1)])
        
        # Portfolio collection indexes
        await database.portfolios.create_index("developer_id")
        await database.portfolios.create_index("is_public")
        await database.portfolios.create_index([("skills.name", 1)])
        await database.portfolios.create_index([("ai_insights.code_quality_score", -1)])
        await database.portfolios.create_index([("created_at", -1)])
        await database.portfolios.create_index([("updated_at", -1)])
        
        # Review collection indexes
        await database.reviews.create_index("portfolio_id")
        await database.reviews.create_index("recruiter_id")
        await database.reviews.create_index([("created_at", -1)])
        await database.reviews.create_index([("rating", -1)])
        
        # GitHub data collection indexes (for caching)
        await database.github_cache.create_index("username", unique=True)
        await database.github_cache.create_index([("last_updated", 1)], expireAfterSeconds=3600)  # 1 hour TTL
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise
