from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import UserCreate, User, Token, GitHubTokenResponse, GitHubUser
from app.services.auth_service import AuthService
from app.services.github_service import GitHubService
from app.core.database import get_database
from app.core.security import create_access_token, verify_token
from datetime import timedelta
from typing import Dict

router = APIRouter()
security = HTTPBearer()

@router.post("/github/callback", response_model=Token)
async def github_callback(
    callback_data: Dict[str, str],
    db=Depends(get_database)
):
    """
    Handle GitHub OAuth callback and create/login user.
    """
    try:
        code = callback_data.get("code")
        user_type = callback_data.get("userType", "developer")
        
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code is required"
            )
        
        # Initialize services
        auth_service = AuthService(db)
        github_service = GitHubService()
        
        # Exchange code for access token
        github_token = await github_service.exchange_code_for_token(code)
        
        # Get GitHub user data
        github_user = await github_service.get_user_data(github_token.access_token)
        
        # Check if user already exists
        existing_user = await auth_service.get_user_by_github_id(str(github_user.id))
        
        if existing_user:
            # Update last login
            await auth_service.update_last_login(existing_user.id)
            user = existing_user
        else:
            # Create new user
            user_data = UserCreate(
                email=github_user.email or f"{github_user.login}@github.local",
                name=github_user.name or github_user.login,
                user_type=user_type,
                github_username=github_user.login
            )
            
            user = await auth_service.create_user_from_github(user_data, github_user)
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id)},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=1800,  # 30 minutes
            user=user
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/me", response_model=User)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_database)
):
    """
    Get current authenticated user.
    """
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get user from database
        auth_service = AuthService(db)
        user = await auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_database)
):
    """
    Refresh access token.
    """
    try:
        # Verify current token
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get user
        auth_service = AuthService(db)
        user = await auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id)},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=1800,
            user=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )

@router.post("/logout")
async def logout():
    """
    Logout user (client should remove token).
    """
    return {"message": "Successfully logged out"}

# Dependency to get current user
async def get_current_active_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_database)
) -> User:
    """
    Dependency to get current authenticated user.
    """
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        auth_service = AuthService(db)
        user = await auth_service.get_user_by_id(user_id)
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
