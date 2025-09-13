from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time
import hashlib
import secrets
from typing import Dict, Any
import redis
import json
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import re
from app.core.config import settings

class SecurityMiddleware(BaseHTTPMiddleware):
    """Enhanced security middleware for comprehensive protection."""
    
    def __init__(self, app, redis_client=None):
        super().__init__(app)
        self.redis_client = redis_client or redis.Redis(
            host='localhost', port=6379, db=0, decode_responses=True
        )
        self.blocked_patterns = [
            r'<script.*?>',
            r'javascript:',
            r'on\w+\s*=',
            r'eval\s*\(',
            r'expression\s*\(',
            r'url\s*\(',
        ]
        
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Security headers middleware
        response = await self.add_security_headers(request, call_next)
        
        # Add processing time
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    async def add_security_headers(self, request: Request, call_next):
        """Add comprehensive security headers."""
        
        # XSS and injection protection
        await self.validate_request_content(request)
        
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), "
            "payment=(), usb=(), magnetometer=(), accelerometer=(), "
            "gyroscope=(), speaker=()"
        )
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.github.com; "
            "frame-ancestors 'none'; "
            "object-src 'none'; "
            "base-uri 'self'"
        )
        response.headers["Content-Security-Policy"] = csp
        
        # HTTPS enforcement (if not in development)
        if not request.url.hostname in ['localhost', '127.0.0.1']:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        return response
    
    async def validate_request_content(self, request: Request):
        """Validate request for malicious content."""
        
        # Check URL path for suspicious patterns
        path = str(request.url.path).lower()
        
        for pattern in self.blocked_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Malicious content detected in request"
                )
        
        # Check query parameters
        for key, value in request.query_params.items():
            for pattern in self.blocked_patterns:
                if re.search(pattern, str(value), re.IGNORECASE):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Malicious content detected in query parameters"
                    )
        
        # Check headers for suspicious content
        for header_name, header_value in request.headers.items():
            if header_name.lower() not in ['user-agent', 'accept', 'accept-language']:
                for pattern in self.blocked_patterns:
                    if re.search(pattern, str(header_value), re.IGNORECASE):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Malicious content detected in headers"
                        )

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Advanced rate limiting middleware."""
    
    def __init__(self, app, redis_client=None):
        super().__init__(app)
        self.redis_client = redis_client or redis.Redis(
            host='localhost', port=6379, db=0, decode_responses=True
        )
        
        # Rate limit configurations
        self.rate_limits = {
            '/api/auth/': {'requests': 5, 'window': 60},      # Auth endpoints
            '/api/': {'requests': 60, 'window': 60},          # General API
            '/': {'requests': 100, 'window': 60},             # Frontend routes
        }
        
    async def dispatch(self, request: Request, call_next):
        """Apply rate limiting based on endpoint."""
        
        # Get client identifier
        client_id = self.get_client_identifier(request)
        
        # Check rate limit
        if await self.is_rate_limited(request, client_id):
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "retry_after": 60
                },
                headers={"Retry-After": "60"}
            )
        
        return await call_next(request)
    
    def get_client_identifier(self, request: Request) -> str:
        """Get unique client identifier for rate limiting."""
        # Use X-Forwarded-For if available (behind proxy)
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            client_ip = forwarded_for.split(',')[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        # Include user agent for more specific identification
        user_agent = request.headers.get('User-Agent', 'unknown')
        client_hash = hashlib.sha256(f"{client_ip}:{user_agent}".encode()).hexdigest()[:16]
        
        return f"rate_limit:{client_hash}"
    
    async def is_rate_limited(self, request: Request, client_id: str) -> bool:
        """Check if client has exceeded rate limit."""
        path = request.url.path
        
        # Determine rate limit config based on path
        rate_config = {'requests': 100, 'window': 60}  # Default
        
        for pattern, config in self.rate_limits.items():
            if path.startswith(pattern):
                rate_config = config
                break
        
        # Redis key for this client and endpoint
        redis_key = f"{client_id}:{path.split('/')[1] if len(path.split('/')) > 1 else 'root'}"
        
        try:
            current_requests = self.redis_client.get(redis_key)
            
            if current_requests is None:
                # First request
                self.redis_client.setex(redis_key, rate_config['window'], 1)
                return False
            
            current_count = int(current_requests)
            
            if current_count >= rate_config['requests']:
                return True  # Rate limited
            
            # Increment counter
            self.redis_client.incr(redis_key)
            return False
            
        except Exception as e:
            # On Redis error, allow request but log error
            print(f"Rate limiting error: {e}")
            return False

class CSRFMiddleware(BaseHTTPMiddleware):
    """CSRF protection middleware."""
    
    def __init__(self, app):
        super().__init__(app)
        self.exempt_methods = ['GET', 'HEAD', 'OPTIONS']
        self.exempt_paths = ['/api/auth/csrf-token', '/api/health']
    
    async def dispatch(self, request: Request, call_next):
        """Validate CSRF tokens for state-changing requests."""
        
        # Skip CSRF check for safe methods and exempt paths
        if (request.method in self.exempt_methods or 
            any(request.url.path.startswith(path) for path in self.exempt_paths)):
            return await call_next(request)
        
        # Check for CSRF token in header
        csrf_header = request.headers.get('X-CSRF-Token')
        csrf_cookie = request.cookies.get('csrf_token')
        
        if not csrf_header or not csrf_cookie:
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF token missing"}
            )
        
        # Verify token matches
        if not secrets.compare_digest(csrf_header, csrf_cookie):
            return JSONResponse(
                status_code=403,
                content={"detail": "Invalid CSRF token"}
            )
        
        return await call_next(request)

def setup_security_middleware(app: FastAPI):
    """Setup all security middleware for the FastAPI app."""
    
    # Initialize Redis for rate limiting and security
    try:
        redis_client = redis.Redis(
            host='localhost', 
            port=6379, 
            db=0, 
            decode_responses=True,
            socket_connect_timeout=1,
            socket_timeout=1
        )
        # Test connection
        redis_client.ping()
        print("✅ Redis connected successfully")
    except Exception as e:
        print(f"⚠️ Redis connection failed: {e}. Using in-memory fallback.")
        redis_client = None
    
    # Trust only specific hosts in production
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "portreview.appwrite.network", "*.appwrite.network"]
    )
    
    # CORS with permissive settings for development
    cors_origins = settings.cors_origins if settings.environment == "production" else ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,  # Required for httpOnly cookies
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Process-Time"]
    )
    
    # Custom security middleware (disabled for development)
    # app.add_middleware(SecurityMiddleware, redis_client=redis_client)
    # app.add_middleware(RateLimitMiddleware, redis_client=redis_client)
    # app.add_middleware(CSRFMiddleware)
    
    print("⚠️ Security middleware disabled for development")
    
    # Rate limiting with slowapi (disabled for development)
    # limiter = Limiter(key_func=get_remote_address)
    # app.state.limiter = limiter
    # app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    return app

def create_secure_response_headers() -> Dict[str, str]:
    """Create standard secure response headers."""
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY", 
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
    }