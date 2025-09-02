from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Database
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "portreviewer"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # GitHub OAuth
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    github_redirect_uri: str = "http://localhost:3000/auth/callback"
    
    # External APIs
    github_token: Optional[str] = None
    gemini_api_key: Optional[str] = None
    
    # CORS - simplified to avoid JSON parsing issues
    backend_cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    @property
    def cors_origins(self) -> List[str]:
        """Convert CORS string to list"""
        return [origin.strip() for origin in self.backend_cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
