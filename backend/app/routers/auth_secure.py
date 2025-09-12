from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import UserCreate, User, Token
from app.services.auth_service import AuthService
from app.services.github_service import GitHubService
from app.core.database import get_database
from app.core.security_enhanced import (
    security_manager, 
    rate_limit_auth, 
    get_current_user_secure, 
    verify_csrf_token_dependency,
    validate_request_data
)
from datetime import timedelta
from typing import Dict
from pydantic import BaseModel, EmailStr, validator
from slowapi.util import get_remote_address
import re

router = APIRouter()
security = HTTPBearer()

class GitHubCallbackRequest(BaseModel):
    code: str
    userType: str = "developer"
    
    @validator('code')
    def validate_code(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Authorization code is required')
        return v.strip()
    
    @validator('userType')
    def validate_user_type(cls, v):
        if v not in ['developer', 'recruiter']:
            raise ValueError('Invalid user type')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if not v or len(v) < 8:
            raise ValueError('Password is required')
        return v

class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    user_type: str
    github_username: str = None
    company: str = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Name is required')
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        # Remove special characters except spaces, hyphens, apostrophes
        if not re.match(r"^[a-zA-Z\s\-']+$", v.strip()):
            raise ValueError('Name contains invalid characters')
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        is_valid, errors = security_manager.validate_password_strength(v)
        if not is_valid:
            raise ValueError('; '.join(errors))
        return v
    
    @validator('user_type')
    def validate_user_type(cls, v):
        if v not in ['developer', 'recruiter']:
            raise ValueError('Invalid user type')
        return v
    
    @validator('github_username')
    def validate_github_username(cls, v):
        if v and not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-])*[a-zA-Z0-9]$', v):
            raise ValueError('Invalid GitHub username format')
        return v

class RefreshTokenRequest(BaseModel):
    refresh_token: str = None  # Optional, will try cookie first

@router.post("/github/callback", response_model=Dict)
@rate_limit_auth(5)  # 5 requests per minute
async def github_callback(
    callback_data: GitHubCallbackRequest,
    request: Request,
    response: Response,
    db=Depends(get_database)
):
    """
    Handle GitHub OAuth callback and create/login user with secure tokens.
    """
    try:
        # Validate and sanitize input data
        sanitized_data = validate_request_data(callback_data.dict())
        
        code = sanitized_data["code"]
        user_type = sanitized_data["userType"]
        
        # Get client info for device binding
        user_agent = request.headers.get("User-Agent", "")
        ip_address = get_remote_address(request)
        
        # Initialize services
        auth_service = AuthService(db)
        github_service = GitHubService()
        
        # Exchange code for access token
        github_token = await github_service.exchange_code_for_token(code)
        
        # Get GitHub user data
        github_user = await github_service.get_user_data(github_token["access_token"])
        
        # Check if user already exists by GitHub ID
        existing_user = await auth_service.get_user_by_github_username(github_user["login"])
        
        if existing_user:
            # Update last login
            await auth_service.update_last_login(existing_user.id)
            user = existing_user
        else:
            # Create new user
            user_data = UserCreate(
                email=github_user["email"] or f"{github_user['login']}@github.local",
                name=security_manager.sanitize_input(github_user["name"] or github_user["login"]),
                user_type=user_type,
                github_username=github_user["login"],
                avatar_url=github_user.get("avatar_url")
            )
            
            user = await auth_service.create_user_from_github(user_data, github_user)
        
        # Clear any failed login attempts
        security_manager.clear_failed_login_attempts(user.email)
        
        # Create secure tokens
        access_token = security_manager.create_access_token(
            data={"sub": user.email, "user_id": str(user.id)},
            user_id=str(user.id)
        )
        
        refresh_token = security_manager.create_refresh_token(
            user_id=str(user.id),
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        # Set secure httpOnly cookies
        security_manager.set_secure_cookies(response, access_token, refresh_token)
        
        return {
            "success": True,
            "message": "Authentication successful",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "user_type": user.user_type,
                "github_username": user.github_username,
                "avatar_url": user.avatar_url
            },
            "expires_in": 900  # 15 minutes
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )

@router.post("/signup", response_model=Dict)
@rate_limit_auth(3)  # 3 signups per minute
async def signup(
    signup_data: SignUpRequest,
    request: Request,
    response: Response,
    db=Depends(get_database)
):
    """
    Register a new user with enhanced security.
    """
    try:
        # Validate and sanitize input data
        sanitized_data = validate_request_data(signup_data.dict())
        
        # Get client info for device binding
        user_agent = request.headers.get("User-Agent", "")
        ip_address = get_remote_address(request)
        
        auth_service = AuthService(db)
        
        # Check if user already exists
        existing_user = await auth_service.get_user_by_email(sanitized_data["email"])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user_data = UserCreate(
            email=sanitized_data["email"],
            name=sanitized_data["name"],
            user_type=sanitized_data["user_type"],
            github_username=sanitized_data.get("github_username"),
            company=sanitized_data.get("company")
        )
        
        user = await auth_service.create_user(user_data, sanitized_data["password"])
        
        # Create secure tokens
        access_token = security_manager.create_access_token(
            data={"sub": user.email, "user_id": str(user.id)},
            user_id=str(user.id)
        )
        
        refresh_token = security_manager.create_refresh_token(
            user_id=str(user.id),
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        # Set secure httpOnly cookies
        security_manager.set_secure_cookies(response, access_token, refresh_token)
        
        return {
            "success": True,
            "message": "Registration successful",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "user_type": user.user_type
            },
            "expires_in": 900
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Dict)
@rate_limit_auth(5)  # 5 login attempts per minute
async def login(
    login_data: LoginRequest,
    request: Request,
    response: Response,
    db=Depends(get_database)
):
    """
    Login with email and password with enhanced security.
    """
    try:
        # Validate and sanitize input data
        sanitized_data = validate_request_data(login_data.dict())
        
        email = sanitized_data["email"]
        password = sanitized_data["password"]
        
        # Check for account lockout
        if not security_manager.check_failed_login_attempts(email):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Account temporarily locked due to too many failed login attempts"
            )
        
        # Get client info for device binding
        user_agent = request.headers.get("User-Agent", "")
        ip_address = get_remote_address(request)
        
        auth_service = AuthService(db)
        
        # Authenticate user
        user = await auth_service.authenticate_user(email, password)
        
        if not user:
            # Record failed login attempt
            security_manager.record_failed_login(email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Clear failed login attempts on successful login
        security_manager.clear_failed_login_attempts(email)
        
        # Create secure tokens
        access_token = security_manager.create_access_token(
            data={"sub": user.email, "user_id": str(user.id)},
            user_id=str(user.id)
        )
        
        refresh_token = security_manager.create_refresh_token(
            user_id=str(user.id),
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        # Set secure httpOnly cookies
        security_manager.set_secure_cookies(response, access_token, refresh_token)
        
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "user_type": user.user_type
            },
            "expires_in": 900
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.post("/refresh", response_model=Dict)
@rate_limit_auth(10)  # 10 refresh attempts per minute
async def refresh_token(
    request: Request,
    response: Response,
    refresh_data: RefreshTokenRequest = None,
    db=Depends(get_database)
):
    """
    Refresh access token using secure refresh token.
    """
    try:
        # Get refresh token from cookie (preferred) or body
        refresh_token_value = request.cookies.get("refresh_token")
        if not refresh_token_value and refresh_data and refresh_data.refresh_token:
            refresh_token_value = refresh_data.refresh_token
        
        if not refresh_token_value:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found"
            )
        
        # Get client info for device verification
        user_agent = request.headers.get("User-Agent", "")
        ip_address = get_remote_address(request)
        
        # Verify refresh token
        payload = security_manager.verify_token(refresh_token_value, "refresh")
        user_id = payload.get("user_id")
        device_hash = payload.get("device_hash")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify device binding
        expected_device_hash = security_manager._create_device_hash(user_agent, ip_address)
        if device_hash != expected_device_hash:
            # Revoke all user tokens on device mismatch (possible token theft)
            security_manager.revoke_all_user_tokens(user_id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Device verification failed. Please log in again."
            )
        
        # Get user from database
        auth_service = AuthService(db)
        user = await auth_service.get_user_by_id(user_id)
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Revoke old refresh token
        jti = payload.get("jti")
        if jti:
            security_manager.revoke_token(user_id, jti, "refresh")
        
        # Create new tokens (refresh token rotation)
        new_access_token = security_manager.create_access_token(
            data={"sub": user.email, "user_id": str(user.id)},
            user_id=str(user.id)
        )
        
        new_refresh_token = security_manager.create_refresh_token(
            user_id=str(user.id),
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        # Set new secure cookies
        security_manager.set_secure_cookies(response, new_access_token, new_refresh_token)
        
        return {
            "success": True,
            "message": "Token refreshed successfully",
            "expires_in": 900
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user=Depends(get_current_user_secure)
):
    """
    Logout user and revoke all tokens.
    """
    try:
        user_id = current_user["user_id"]
        
        # Revoke all user tokens
        security_manager.revoke_all_user_tokens(user_id)
        
        # Clear auth cookies
        security_manager.clear_auth_cookies(response)
        
        return {"success": True, "message": "Successfully logged out"}
        
    except Exception:
        # Clear cookies even if token revocation fails
        security_manager.clear_auth_cookies(response)
        return {"success": True, "message": "Successfully logged out"}

@router.post("/logout-all-devices")
async def logout_all_devices(
    request: Request,
    response: Response,
    current_user=Depends(get_current_user_secure),
    _csrf=Depends(verify_csrf_token_dependency)
):
    """
    Logout from all devices (revoke all refresh tokens).
    """
    try:
        user_id = current_user["user_id"]
        
        # Revoke all user tokens across all devices
        security_manager.revoke_all_user_tokens(user_id)
        
        # Clear auth cookies
        security_manager.clear_auth_cookies(response)
        
        return {"success": True, "message": "Logged out from all devices"}
        
    except Exception:
        security_manager.clear_auth_cookies(response)
        return {"success": True, "message": "Logged out from all devices"}

@router.get("/me")
async def get_current_user_info(
    current_user=Depends(get_current_user_secure),
    db=Depends(get_database)
):
    """
    Get current user information.
    """
    try:
        user_id = current_user["user_id"]
        
        auth_service = AuthService(db)
        user = await auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "user_type": user.user_type,
                "github_username": user.github_username,
                "avatar_url": user.avatar_url,
                "company": user.company,
                "is_active": user.is_active
            }
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve user information"
        )

@router.get("/csrf-token")
async def get_csrf_token(request: Request):
    """
    Get CSRF token for frontend requests.
    """
    csrf_token = request.cookies.get("csrf_token")
    
    if not csrf_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No active session"
        )
    
    return {"csrf_token": csrf_token}

# Export secure dependency for other routers
get_current_active_user = get_current_user_secure