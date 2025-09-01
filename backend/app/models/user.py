from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any, Annotated
from datetime import datetime
from enum import Enum
from bson import ObjectId

# Simple ObjectId field for Pydantic v2
PyObjectId = Annotated[str, Field(description="MongoDB ObjectId as string")]

class UserType(str, Enum):
    DEVELOPER = "developer"
    RECRUITER = "recruiter"

class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr
    name: str
    user_type: UserType

class UserCreate(UserBase):
    """User creation model."""
    github_username: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None

class UserUpdate(BaseModel):
    """User update model."""
    name: Optional[str] = None
    github_username: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None

class User(UserBase):
    """Public user model."""
    id: str
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

class UserPublic(BaseModel):
    """Public user profile model (limited information)."""
    id: str
    name: str
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class UserInDB(User):
    """User model for database operations."""
    hashed_password: Optional[str] = None

# GitHub OAuth models
class GitHubUser(BaseModel):
    """GitHub user data model."""
    id: int
    login: str
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    public_repos: int
    followers: int
    following: int
    created_at: str
    updated_at: str

class GitHubTokenResponse(BaseModel):
    """GitHub OAuth token response model."""
    access_token: str
    token_type: str
    scope: str

# Authentication models
class Token(BaseModel):
    """JWT token model."""
    access_token: str
    token_type: str
    expires_in: int
    user: User

class TokenData(BaseModel):
    """JWT token data model."""
    email: Optional[str] = None
    user_id: Optional[str] = None
