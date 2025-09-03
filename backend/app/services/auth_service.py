from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import User, UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from bson import ObjectId
from typing import Optional, Dict, Any
from datetime import datetime

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users
    
    async def create_user_from_github(self, user_data: UserCreate, github_user: Dict[str, Any]) -> User:
        """
        Create a new user from GitHub OAuth data.
        """
        # Create user document
        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "user_type": user_data.user_type,
            "github_username": user_data.github_username,
            "github_id": str(github_user.get("id", "")),
            "avatar_url": user_data.avatar_url or github_user.get("avatar_url", ""),
            "bio": github_user.get("bio", ""),
            "company": github_user.get("company", ""),
            "location": github_user.get("location", ""),
            "blog": github_user.get("blog", ""),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "github_data": {
                "public_repos": github_user.get("public_repos", 0),
                "followers": github_user.get("followers", 0),
                "following": github_user.get("following", 0),
                "created_at": github_user.get("created_at"),
                "updated_at": github_user.get("updated_at")
            }
        }
        
        # Insert user
        result = await self.collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        user_doc["id"] = result.inserted_id
        
        return User(**user_doc)
    
    async def create_user(self, user_data: UserCreate, password: str) -> User:
        """
        Create a new user with email/password.
        """
        hashed_password = get_password_hash(password)
        
        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "user_type": user_data.user_type,
            "github_username": user_data.github_username,
            "company": user_data.company,
            "avatar_url": user_data.avatar_url or "",
            "bio": "",
            "location": "",
            "blog": "",
            "hashed_password": hashed_password,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        user_doc["id"] = result.inserted_id
        
        return User(**user_doc)
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password.
        """
        user_doc = await self.collection.find_one({"email": email})
        if not user_doc:
            return None
        
        # Check password
        if not verify_password(password, user_doc.get("hashed_password", "")):
            return None
        
        # Update last login
        await self.update_last_login(user_doc["_id"])
        
        user_doc["id"] = user_doc["_id"]
        return User(**user_doc)
    
    async def get_user_by_github_username(self, github_username: str) -> Optional[User]:
        """
        Get user by GitHub username.
        """
        user_doc = await self.collection.find_one({"github_username": github_username})
        if user_doc:
            user_doc["id"] = user_doc["_id"]
            return User(**user_doc)
        return None
    
    async def get_user_by_github_id(self, github_id: str) -> Optional[User]:
        """
        Get user by GitHub ID.
        """
        user_doc = await self.collection.find_one({"github_id": github_id})
        if user_doc:
            user_doc["id"] = user_doc["_id"]
            return User(**user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Get user by ID (string format).
        """
        try:
            object_id = ObjectId(user_id)
            user_doc = await self.collection.find_one({"_id": object_id})
            if user_doc:
                user_doc["id"] = user_doc["_id"]
                return User(**user_doc)
        except:
            pass
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.
        """
        user_doc = await self.collection.find_one({"email": email})
        if user_doc:
            user_doc["id"] = user_doc["_id"]
            return User(**user_doc)
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
            return await self.get_user_by_id(str(user_id))
        return None
