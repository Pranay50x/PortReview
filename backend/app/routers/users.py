from fastapi import APIRouter, HTTPException, Depends, status, Query
from app.models.user import User, UserUpdate, UserPublic
from app.services.user_service import UserService
from app.routers.auth import get_current_active_user
from app.core.database import get_database
from typing import List, Optional
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=User)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's profile.
    """
    return current_user

@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Update current user's profile.
    """
    user_service = UserService(db)
    
    try:
        updated_user = await user_service.update_user(
            current_user.id,
            user_update
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return updated_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.get("/", response_model=List[UserPublic])
async def search_users(
    search: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    skills: Optional[List[str]] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Search users. 
    Recruiters can search developers.
    Developers can search other developers and recruiters.
    """
    user_service = UserService(db)
    
    # Apply filters based on user type
    if current_user.user_type == "recruiter":
        # Recruiters can only search developers
        user_type = "developer"
    
    users = await user_service.search_users(
        search=search,
        user_type=user_type,
        skills=skills,
        skip=skip,
        limit=limit,
        exclude_user_id=current_user.id  # Don't include current user in results
    )
    
    return users

@router.get("/{user_id}", response_model=UserPublic)
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Get a user's public profile.
    """
    try:
        user_service = UserService(db)
        user = await user_service.get_user_by_id(ObjectId(user_id))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Convert to public profile
        return UserPublic(**user.dict())
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

@router.get("/{user_id}/stats")
async def get_user_stats(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Get user statistics (portfolio count, reviews, etc.).
    """
    try:
        user_service = UserService(db)
        
        # Check if user exists
        user = await user_service.get_user_by_id(ObjectId(user_id))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user statistics
        stats = await user_service.get_user_stats(ObjectId(user_id))
        
        return stats
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

@router.delete("/me")
async def delete_current_user_account(
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Delete current user's account and all associated data.
    """
    user_service = UserService(db)
    
    try:
        await user_service.delete_user(current_user.id)
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete account: {str(e)}"
        )

@router.post("/{user_id}/follow")
async def follow_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Follow another user.
    """
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    try:
        user_service = UserService(db)
        
        # Check if target user exists
        target_user = await user_service.get_user_by_id(ObjectId(user_id))
        
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Add to following list
        success = await user_service.follow_user(
            follower_id=current_user.id,
            following_id=ObjectId(user_id)
        )
        
        if success:
            return {"message": "User followed successfully"}
        else:
            return {"message": "Already following this user"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Unfollow a user.
    """
    try:
        user_service = UserService(db)
        
        success = await user_service.unfollow_user(
            follower_id=current_user.id,
            following_id=ObjectId(user_id)
        )
        
        if success:
            return {"message": "User unfollowed successfully"}
        else:
            return {"message": "Not following this user"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

@router.get("/{user_id}/followers", response_model=List[UserPublic])
async def get_user_followers(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Get a user's followers.
    """
    try:
        user_service = UserService(db)
        
        followers = await user_service.get_user_followers(
            ObjectId(user_id),
            skip=skip,
            limit=limit
        )
        
        return followers
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

@router.get("/{user_id}/following", response_model=List[UserPublic])
async def get_user_following(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_database)
):
    """
    Get users that a user is following.
    """
    try:
        user_service = UserService(db)
        
        following = await user_service.get_user_following(
            ObjectId(user_id),
            skip=skip,
            limit=limit
        )
        
        return following
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
