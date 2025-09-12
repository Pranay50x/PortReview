from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from typing import Optional, Dict, Any
import secrets
import hashlib
import redis
import json
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
from bleach import clean

# Initialize rate limiter with Redis
limiter = Limiter(key_func=get_remote_address)

# Password hashing with stronger context
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12  # Increased rounds for better security
)

# Security setup
security = HTTPBearer(auto_error=False)

# Redis connection for session management
redis_client = redis.Redis(
    host=getattr(settings, 'redis_host', 'localhost'),
    port=getattr(settings, 'redis_port', 6379),
    db=getattr(settings, 'redis_db', 0),
    decode_responses=True
)

class SecurityManager:
    """Enhanced security manager with comprehensive protection."""
    
    def __init__(self):
        self.access_token_expire_minutes = 15  # Short-lived access tokens
        self.refresh_token_expire_days = 7     # 7 day refresh tokens
        self.max_failed_attempts = 5          # Account lockout threshold
        self.lockout_duration_minutes = 30    # Account lockout duration
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate secure password hash."""
        return pwd_context.hash(password)
    
    def validate_password_strength(self, password: str) -> tuple[bool, list[str]]:
        """Validate password meets security requirements."""
        errors = []
        
        if len(password) < 12:
            errors.append("Password must be at least 12 characters long")
        
        if not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not re.search(r"\d", password):
            errors.append("Password must contain at least one number")
        
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            errors.append("Password must contain at least one special character")
        
        # Check for common patterns
        if re.search(r"(.)\1{2,}", password):
            errors.append("Password cannot contain repeated characters")
        
        return len(errors) == 0, errors
    
    def create_access_token(self, data: Dict[str, Any], user_id: str) -> str:
        """Create short-lived JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        # Add security claims
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
            "jti": secrets.token_urlsafe(32),  # JWT ID for revocation
        })
        
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        
        # Store token metadata in Redis for revocation checks
        token_key = f"access_token:{user_id}:{to_encode['jti']}"
        redis_client.setex(
            token_key,
            timedelta(minutes=self.access_token_expire_minutes),
            json.dumps({"created_at": datetime.utcnow().isoformat()})
        )
        
        return encoded_jwt
    
    def create_refresh_token(self, user_id: str, user_agent: str, ip_address: str) -> str:
        """Create secure refresh token with device binding."""
        token_data = {
            "user_id": user_id,
            "type": "refresh",
            "jti": secrets.token_urlsafe(32),
            "device_hash": self._create_device_hash(user_agent, ip_address),
            "exp": datetime.utcnow() + timedelta(days=self.refresh_token_expire_days),
            "iat": datetime.utcnow()
        }
        
        refresh_token = jwt.encode(token_data, settings.secret_key, algorithm=settings.algorithm)
        
        # Store refresh token in Redis with rotation tracking
        refresh_key = f"refresh_token:{user_id}:{token_data['jti']}"
        redis_client.setex(
            refresh_key,
            timedelta(days=self.refresh_token_expire_days),
            json.dumps({
                "device_hash": token_data["device_hash"],
                "created_at": datetime.utcnow().isoformat(),
                "last_used": datetime.utcnow().isoformat()
            })
        )
        
        return refresh_token
    
    def _create_device_hash(self, user_agent: str, ip_address: str) -> str:
        """Create device fingerprint for security binding."""
        device_string = f"{user_agent}:{ip_address}"
        return hashlib.sha256(device_string.encode()).hexdigest()
    
    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify JWT token and check revocation status."""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            
            # Verify token type
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            # Check if token is revoked
            user_id = payload.get("user_id") or payload.get("sub")
            jti = payload.get("jti")
            
            if user_id and jti:
                token_key = f"{token_type}_token:{user_id}:{jti}"
                if not redis_client.exists(token_key):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token has been revoked"
                    )
            
            return payload
            
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def revoke_token(self, user_id: str, jti: str, token_type: str = "access"):
        """Revoke a specific token."""
        token_key = f"{token_type}_token:{user_id}:{jti}"
        redis_client.delete(token_key)
    
    def revoke_all_user_tokens(self, user_id: str):
        """Revoke all tokens for a user (logout from all devices)."""
        # Find all user tokens
        access_pattern = f"access_token:{user_id}:*"
        refresh_pattern = f"refresh_token:{user_id}:*"
        
        # Delete all access tokens
        for key in redis_client.scan_iter(match=access_pattern):
            redis_client.delete(key)
        
        # Delete all refresh tokens
        for key in redis_client.scan_iter(match=refresh_pattern):
            redis_client.delete(key)
    
    def check_failed_login_attempts(self, identifier: str) -> bool:
        """Check if account is locked due to failed login attempts."""
        attempts_key = f"failed_attempts:{identifier}"
        attempts = redis_client.get(attempts_key)
        
        if attempts and int(attempts) >= self.max_failed_attempts:
            return False  # Account is locked
        
        return True  # Account is not locked
    
    def record_failed_login(self, identifier: str):
        """Record a failed login attempt."""
        attempts_key = f"failed_attempts:{identifier}"
        current_attempts = redis_client.get(attempts_key)
        
        if current_attempts:
            new_attempts = int(current_attempts) + 1
        else:
            new_attempts = 1
        
        # Set with expiration
        redis_client.setex(
            attempts_key,
            timedelta(minutes=self.lockout_duration_minutes),
            new_attempts
        )
    
    def clear_failed_login_attempts(self, identifier: str):
        """Clear failed login attempts after successful login."""
        attempts_key = f"failed_attempts:{identifier}"
        redis_client.delete(attempts_key)
    
    def sanitize_input(self, input_string: str, allowed_tags: list = None) -> str:
        """Sanitize user input to prevent XSS."""
        if allowed_tags is None:
            allowed_tags = []
        
        # Remove HTML/script tags
        cleaned = clean(input_string, tags=allowed_tags, strip=True)
        
        # Additional sanitization
        cleaned = re.sub(r'[<>"\']', '', cleaned)
        
        return cleaned.strip()
    
    def generate_csrf_token(self) -> str:
        """Generate CSRF token."""
        return secrets.token_urlsafe(32)
    
    def verify_csrf_token(self, token: str, session_token: str) -> bool:
        """Verify CSRF token matches session."""
        return secrets.compare_digest(token, session_token)
    
    def set_secure_cookies(self, response: Response, access_token: str, refresh_token: str):
        """Set secure httpOnly cookies for tokens."""
        # Access token cookie (short-lived)
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=self.access_token_expire_minutes * 60,
            httponly=True,
            secure=True,  # HTTPS only
            samesite="strict",
            path="/"
        )
        
        # Refresh token cookie (longer-lived)
        response.set_cookie(
            key="refresh_token", 
            value=refresh_token,
            max_age=self.refresh_token_expire_days * 24 * 60 * 60,
            httponly=True,
            secure=True,
            samesite="strict", 
            path="/api/auth"  # Restricted path
        )
        
        # CSRF token (accessible to JS)
        csrf_token = self.generate_csrf_token()
        response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            max_age=self.refresh_token_expire_days * 24 * 60 * 60,
            httponly=False,  # Accessible to JS
            secure=True,
            samesite="strict",
            path="/"
        )
    
    def clear_auth_cookies(self, response: Response):
        """Clear all authentication cookies."""
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/api/auth")
        response.delete_cookie("csrf_token", path="/")

# Create global security manager instance
security_manager = SecurityManager()

# Rate limiting decorators
def rate_limit_auth(requests_per_minute: int = 5):
    """Rate limit decorator for auth endpoints."""
    return limiter.limit(f"{requests_per_minute}/minute")

def rate_limit_api(requests_per_minute: int = 60):
    """Rate limit decorator for API endpoints.""" 
    return limiter.limit(f"{requests_per_minute}/minute")

async def get_current_user_secure(request: Request):
    """
    Secure dependency to get current authenticated user from httpOnly cookie.
    """
    try:
        # Get access token from httpOnly cookie
        access_token = request.cookies.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token not found"
            )
        
        # Verify token
        payload = security_manager.verify_token(access_token, "access")
        user_id = payload.get("user_id") or payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Return user info (in production, fetch from database)
        return {
            "user_id": user_id,
            "email": payload.get("sub"),
            "is_authenticated": True
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def verify_csrf_token_dependency(request: Request):
    """Dependency to verify CSRF token."""
    csrf_token = request.headers.get("X-CSRF-Token")
    cookie_csrf = request.cookies.get("csrf_token")
    
    if not csrf_token or not cookie_csrf:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing"
        )
    
    if not security_manager.verify_csrf_token(csrf_token, cookie_csrf):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token"
        )

def validate_request_data(data: dict) -> dict:
    """Validate and sanitize request data."""
    cleaned_data = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            # Sanitize string inputs
            cleaned_data[key] = security_manager.sanitize_input(value)
        elif isinstance(value, dict):
            # Recursively clean nested dictionaries
            cleaned_data[key] = validate_request_data(value)
        else:
            cleaned_data[key] = value
    
    return cleaned_data

# Export commonly used functions
create_access_token = security_manager.create_access_token
create_refresh_token = security_manager.create_refresh_token
verify_token = security_manager.verify_token
verify_password = security_manager.verify_password
get_password_hash = security_manager.get_password_hash
validate_password_strength = security_manager.validate_password_strength