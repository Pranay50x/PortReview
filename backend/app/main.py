from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, portfolios, users, search
from app.core.database import init_db
from app.core.config import settings

app = FastAPI(
    title="PortReviewer API",
    description="AI-powered technical recruiting platform that analyzes GitHub profiles and generates portfolios",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(portfolios.router, prefix="/api/portfolios", tags=["portfolios"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and connections on startup."""
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
        "status": "healthy"
    }

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "PortReviewer API"
    }
