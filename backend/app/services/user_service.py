from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import User, UserUpdate, UserPublic
from bson import ObjectId
from typing import Optional, List
from datetime import datetime

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users
    
    async def get_user_by_id(self, user_id: ObjectId) -> Optional[User]:
        """
        Get user by ID.
        """
        user_doc = await self.collection.find_one({"_id": user_id})
        if user_doc:
            return User(**user_doc, id=user_doc["_id"])
        return None
    
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
    
    async def search_users(
        self,
        search: Optional[str] = None,
        user_type: Optional[str] = None,
        skills: Optional[List[str]] = None,
        skip: int = 0,
        limit: int = 20,
        exclude_user_id: Optional[ObjectId] = None
    ) -> List[UserPublic]:
        """
        Search users with filters.
        """
        query = {"is_active": True}
        
        if exclude_user_id:
            query["_id"] = {"$ne": exclude_user_id}
        
        if user_type:
            query["user_type"] = user_type
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"github_username": {"$regex": search, "$options": "i"}},
                {"bio": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}}
            ]
        
        if skills:
            query["skills"] = {"$in": skills}
        
        cursor = self.collection.find(query).skip(skip).limit(limit)
        users = []
        
        async for user_doc in cursor:
            public_user = UserPublic(**user_doc, id=user_doc["_id"])
            users.append(public_user)
        
        return users
    
    async def get_user_stats(self, user_id: ObjectId) -> dict:
        """
        Get user statistics.
        """
        # Get portfolio count
        portfolios_count = await self.db.portfolios.count_documents({"user_id": user_id})
        
        # Get reviews count (as reviewer)
        reviews_given = await self.db.reviews.count_documents({"reviewer_id": user_id})
        
        # Get reviews received (for their portfolios)
        portfolios = await self.db.portfolios.find({"user_id": user_id}).to_list(None)
        portfolio_ids = [p["_id"] for p in portfolios]
        reviews_received = await self.db.reviews.count_documents({"portfolio_id": {"$in": portfolio_ids}})
        
        return {
            "portfolios_count": portfolios_count,
            "reviews_given": reviews_given,
            "reviews_received": reviews_received,
            "average_rating": 0.0,  # Calculate from reviews
            "profile_views": 0,  # Would track this separately
            "joined_date": None  # Get from user creation date
        }
    
    async def delete_user(self, user_id: ObjectId) -> bool:
        """
        Delete user and all associated data.
        """
        # Delete user's portfolios
        await self.db.portfolios.delete_many({"user_id": user_id})
        
        # Delete user's reviews
        await self.db.reviews.delete_many({"reviewer_id": user_id})
        
        # Delete the user
        result = await self.collection.delete_one({"_id": user_id})
        return result.deleted_count > 0
    
    async def follow_user(self, follower_id: ObjectId, following_id: ObjectId) -> bool:
        """
        Follow another user.
        """
        # Add to follower's following list
        result1 = await self.collection.update_one(
            {"_id": follower_id},
            {"$addToSet": {"following": following_id}}
        )
        
        # Add to following user's followers list
        result2 = await self.collection.update_one(
            {"_id": following_id},
            {"$addToSet": {"followers": follower_id}}
        )
        
        return result1.modified_count > 0 or result2.modified_count > 0
    
    async def unfollow_user(self, follower_id: ObjectId, following_id: ObjectId) -> bool:
        """
        Unfollow a user.
        """
        # Remove from follower's following list
        result1 = await self.collection.update_one(
            {"_id": follower_id},
            {"$pull": {"following": following_id}}
        )
        
        # Remove from following user's followers list
        result2 = await self.collection.update_one(
            {"_id": following_id},
            {"$pull": {"followers": follower_id}}
        )
        
        return result1.modified_count > 0 or result2.modified_count > 0
    
    async def get_user_followers(self, user_id: ObjectId, skip: int = 0, limit: int = 20) -> List[UserPublic]:
        """
        Get user's followers.
        """
        user = await self.get_user_by_id(user_id)
        if not user or not hasattr(user, 'followers'):
            return []
        
        follower_ids = getattr(user, 'followers', [])
        if not follower_ids:
            return []
        
        cursor = self.collection.find(
            {"_id": {"$in": follower_ids[skip:skip+limit]}}
        )
        
        followers = []
        async for user_doc in cursor:
            public_user = UserPublic(**user_doc, id=user_doc["_id"])
            followers.append(public_user)
        
        return followers
    
    async def get_user_following(self, user_id: ObjectId, skip: int = 0, limit: int = 20) -> List[UserPublic]:
        """
        Get users that a user is following.
        """
        user = await self.get_user_by_id(user_id)
        if not user or not hasattr(user, 'following'):
            return []
        
        following_ids = getattr(user, 'following', [])
        if not following_ids:
            return []
        
        cursor = self.collection.find(
            {"_id": {"$in": following_ids[skip:skip+limit]}}
        )
        
        following = []
        async for user_doc in cursor:
            public_user = UserPublic(**user_doc, id=user_doc["_id"])
            following.append(public_user)
        
        return following
