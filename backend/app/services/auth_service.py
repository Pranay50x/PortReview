from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import User, UserCreate, UserInDB, UserUpdate, UserPublic, GitHubUser
from app.core.security import get_password_hash
from bson import ObjectId
from typing import Optional, List
from datetime import datetime

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users
    
    async def create_user_from_github(self, user_data: UserCreate, github_user: GitHubUser) -> User:
        """
        Create a new user from GitHub OAuth data.
        """
        # Create user document
        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "user_type": user_data.user_type,
            "github_username": user_data.github_username,
            "github_id": str(github_user.id),
            "avatar_url": github_user.avatar_url,
            "bio": github_user.bio,
            "company": github_user.company,
            "location": github_user.location,
            "blog": github_user.blog,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "github_data": {
                "public_repos": github_user.public_repos,
                "followers": github_user.followers,
                "following": github_user.following,
                "created_at": github_user.created_at,
                "updated_at": github_user.updated_at
            }
        }
        
        # Insert user
        result = await self.collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        return User(**user_doc, id=result.inserted_id)
    
    async def get_user_by_github_id(self, github_id: str) -> Optional[User]:
        """
        Get user by GitHub ID.
        """
        user_doc = await self.collection.find_one({"github_id": github_id})
        if user_doc:
            return User(**user_doc, id=user_doc["_id"])
        return None
    
    async def get_user_by_id(self, user_id: ObjectId) -> Optional[User]:
        """
        Get user by ID.
        """
        user_doc = await self.collection.find_one({"_id": user_id})
        if user_doc:
            return User(**user_doc, id=user_doc["_id"])
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.
        """
        user_doc = await self.collection.find_one({"email": email})
        if user_doc:
            return User(**user_doc, id=user_doc["_id"])
        return None
    
    async def update_last_login(self, user_id: ObjectId) -> bool:
        """
        Update user's last login timestamp.
        """
        result = await self.collection.update_one(
            {"_id": user_id},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    async def update_user(self, user_id: ObjectId, user_update: UserUpdate) -> Optional[User]:
        """
        Update user profile.
        """
        update_data = user_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return await self.get_user_by_id(user_id)
        return None
