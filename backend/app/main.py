from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, portfolios, reviews, search, github_ai, github_stats, analytics, auto_portfolio, recruitment_ai
from .routers import auth_secure  # Import secure auth router
from app.core.database import init_db
from app.core.config import settings
from app.middleware.security import setup_security_middleware

app = FastAPI(
    title="PortReviewer API - Secure Edition",
    description="AI-powered portfolio analysis with enhanced security",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup comprehensive security middleware
app = setup_security_middleware(app)

# Include routers - Use secure auth router instead of original
app.include_router(auth_secure.router, prefix="/api/auth", tags=["auth-secure"])
app.include_router(auth.router, prefix="/api/auth/legacy", tags=["auth-legacy"])  # Keep legacy for migration
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(portfolios.router, prefix="/api/portfolios", tags=["portfolios"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(github_ai.router, prefix="/api/github/ai", tags=["github-ai"])
app.include_router(github_stats.router, prefix="/api/github", tags=["github-stats"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(auto_portfolio.router, tags=["auto-portfolio"])
app.include_router(recruitment_ai.router, tags=["recruitment-ai"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup."""
    await init_db()
    print("🚀 PortReviewer API started successfully with enhanced security!")
    print("🛡️  Security features enabled:")
    print("   - httpOnly cookies for tokens")
    print("   - CSRF protection") 
    print("   - Rate limiting")
    print("   - Input sanitization")
    print("   - Security headers")
    print("   - Account lockout protection")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    print("👋 PortReviewer API shutting down...")

@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "🚀 PortReview - Auto-Generated Portfolios from GitHub",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "healthy",
        "unique_selling_points": [
            "🚀 One-Click GitHub Portfolio Auto-Generation",
            "🎯 AI Code Craftsmanship Scoring (0-100)",
            "🔍 Smart Project Impact Analysis", 
            "💬 Contextual Interview Generator",
            "📈 Developer Skill Trajectory Mapping",
            "🔗 Zero-Setup Portfolio Sharing"
        ],
        "auto_portfolio_endpoints": {
            "create": "/api/auto-portfolio/create-from-github",
            "demo": "/api/auto-portfolio/demo/{github_username}",
            "insights": "/api/auto-portfolio/insights/{portfolio_id}",
            "stats": "/api/auto-portfolio/stats"
        }
    }

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "PortReviewer API"
    }
