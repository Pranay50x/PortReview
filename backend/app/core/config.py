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
    github_redirect_uri: str = "https://portreview.appwrite.network/auth/callback"
    
    # External APIs
    github_token: Optional[str] = None
    gemini_api_key: Optional[str] = None
    
    # CORS - load from environment variable
    backend_cors_origins: str = "https://portreview.appwrite.network,http://localhost:3000"
    
    # Environment
    environment: str = "production"
    debug: bool = False
    
    @property
    def cors_origins(self) -> List[str]:
        """Convert CORS string to list"""
        return [origin.strip() for origin in self.backend_cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
