from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # ChromaDB settings
    CHROMA_HOST: str = "chromadb"
    CHROMA_PORT: int = 8000
    CHROMA_COLLECTION: str = "course_embeddings"
    
    # Model settings
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Application settings
    DEBUG: bool = True
    MAX_RECOMMENDATIONS: int = 5
    SIMILARITY_THRESHOLD: float = 0.6
    
    # Auto-load settings
    AUTO_LOAD_COURSES: bool = True
    COURSES_JSON_PATH: str = "/app/data/courses.json"
    
    # Performance settings
    MAX_CONCURRENT_REQUESTS: int = 100
    REQUEST_TIMEOUT: int = 30
    MODEL_CACHE_SIZE: int = 1000
    
    # Health check settings
    HEALTH_CHECK_INTERVAL: int = 30
    HEALTH_CHECK_TIMEOUT: int = 10
    HEALTH_CHECK_RETRIES: int = 3

    class Config:
        env_file = ".env"

settings = Settings()
