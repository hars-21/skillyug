from pydantic_settings import BaseSettings
from typing import Optional

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

    class Config:
        env_file = ".env"

settings = Settings()
