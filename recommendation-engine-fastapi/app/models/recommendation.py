from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any, Literal
from enum import Enum

class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ALL_LEVELS = "all_levels"

class Course(BaseModel):
    id: str
    title: str
    description: str
    level: CourseLevel
    category: str
    tags: List[str] = []
    price: float
    rating: Optional[float] = None
    students_count: int = 0
    instructor: str
    image_url: Optional[HttpUrl] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class UserIntent(BaseModel):
    level: Optional[str] = None
    keywords: List[str] = []
    topics: List[str] = []
    intent_type: Optional[str] = None  # e.g., "learn", "build", "explore"

class RecommendationItem(BaseModel):
    course: Course
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    match_type: Literal["exact", "similar", "fallback"]
    metadata: Optional[Dict[str, Any]] = {}

class RecommendationRequest(BaseModel):
    user_query: str
    ui_chips: List[str] = []
    user_id: Optional[str] = None
    max_results: int = 5
    min_confidence: float = 0.5

class RecommendationResponse(BaseModel):
    query: str
    intent: UserIntent
    recommendations: List[RecommendationItem]
    match_type: Literal["exact", "similar", "fallback"]
    timestamp: str
