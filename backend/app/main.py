from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, github_ai
from app.core.database import init_db
from app.core.config import settings

app = FastAPI(
    title="PortReviewer API",
    description="AI-powered portfolio analysis with authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(github_ai.router, prefix="/api/github", tags=["github-ai"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup."""
    await init_db()
    print("🚀 PortReviewer API started successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    print("👋 PortReviewer API shutting down...")

@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "PortReviewer API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy",
        "features": ["Authentication", "GitHub Analysis", "AI Insights"]
    }

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "PortReviewer API"
    }
