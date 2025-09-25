import os
import time
import logging
from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

# Import services
from .services.model_service import model_service
from .services.vector_store import vector_store
from .services.recommendation_service import recommendation_service
from .services.data_ingestion import data_ingestion_service
from .models.recommendation import (
    RecommendationRequest, 
    RecommendationResponse,
    RecommendationItem,
    Course,
    UserIntent
)
from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Skillyug Recommendation Engine",
    description="API for providing personalized course recommendations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track startup time
start_time = time.time()

# ------------ Models ------------
class HealthCheckResponse(BaseModel):
    status: str
    services: Dict[str, str]
    uptime_seconds: float
    timestamp: str
    version: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    timestamp: str

# ------------ Startup Event ------------
@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup."""
    logger.info("Starting up Skillyug Recommendation Engine...")
    
    try:
        # Initialize model service
        logger.info("Initializing model service...")
        await model_service.initialize()
        
        # Initialize vector store
        logger.info("Initializing vector store...")
        await vector_store.initialize()
        
        # Initialize data ingestion service
        logger.info("Initializing data ingestion service...")
        await data_ingestion_service.initialize()
        
        # Auto-load course data if vector store is empty and auto-load is enabled
        if settings.AUTO_LOAD_COURSES:
            logger.info("Checking if course data needs to be loaded...")
            collection_count = await vector_store.get_collection_count()
            if collection_count == 0:
                logger.info("Vector store is empty, automatically loading course data...")
                try:
                    import os
                    # Try configured path first, then fallback to relative path
                    courses_json_path = settings.COURSES_JSON_PATH
                    if not os.path.exists(courses_json_path):
                        courses_json_path = os.path.join(os.path.dirname(__file__), '../data/courses.json')
                    
                    if os.path.exists(courses_json_path):
                        logger.info(f"Loading courses from {courses_json_path}")
                        await data_ingestion_service.process_json_catalog(courses_json_path)
                        new_count = await vector_store.get_collection_count()
                        logger.info(f"Course data loaded successfully! Vector store now has {new_count} documents")
                    else:
                        logger.warning(f"Course data file not found at {courses_json_path}")
                        logger.info("To load course data, please ensure courses.json exists or use the /api/ingest-json-catalog endpoint")
                except Exception as e:
                    logger.error(f"Failed to auto-load course data: {e}")
                    logger.info("System will continue without pre-loaded course data")
            else:
                logger.info(f"Vector store already has {collection_count} documents, skipping auto-load")
        else:
            logger.info("Auto-load courses is disabled")
        
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        # Don't raise here to allow the app to start, but health check will reflect the error

# ------------ Health Check ------------
@app.get(
    "/health", 
    response_model=HealthCheckResponse, 
    tags=["System"],
    responses={
        200: {"description": "Service is healthy"},
        503: {"description": "Service is degraded"}
    }
)
async def health():
    """Health check endpoint to verify the service is running."""
    services_status = {
        "models": "ready" if model_service.is_initialized else "unavailable",
        "vector_store": "ready" if vector_store.is_initialized else "unavailable"
    }
    
    is_healthy = all(status == "ready" for status in services_status.values())
    status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    
    response = {
        "status": "healthy" if is_healthy else "degraded",
        "services": services_status,
        "uptime_seconds": time.time() - start_time,
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version
    }
    
    return JSONResponse(
        content=response,
        status_code=status_code
    )

# ------------ Recommendation Endpoint ------------
@app.post(
    "/api/recommendations", 
    response_model=Dict[str, Any],
    responses={
        200: {"description": "Successfully generated recommendations"},
        400: {"description": "Invalid request"},
        503: {"description": "Service temporarily unavailable"},
        500: {"description": "Internal server error"}
    }
)
async def get_recommendations(request: RecommendationRequest):
    """
    Get course recommendations based on user query and preferences.
    
    - **user_query**: The main search query from the user
    - **ui_chips**: Additional filter chips/tags from the UI
    - **user_id**: Optional user ID for personalized recommendations
    - **max_results**: Maximum number of recommendations to return (default: 5)
    - **min_confidence**: Minimum confidence score for recommendations (0.0-1.0)
    """
    try:
        logger.info(f"Received recommendation request: {request}")
        
        # Check if services are ready
        if not model_service.is_initialized:
            return {
                "success": False,
                "error": "Model service is not ready. Please try again in a few moments."
            }
        
        if not vector_store.is_initialized:
            return {
                "success": False,
                "error": "Vector store is not ready. Please try again in a few moments."
            }
        
        # Check if we have course data
        collection_count = await vector_store.get_collection_count()
        if collection_count == 0:
            return {
                "success": False,
                "error": "No course data available. The system is still initializing."
            }
        
        # Validate request
        if not request.user_query or not request.user_query.strip():
            return {
                "success": False,
                "error": "user_query is required and cannot be empty"
            }
        
        # Get recommendations
        response = await recommendation_service.get_recommendations(request)
        
        logger.info(f"Generated {len(response.recommendations)} recommendations")
        
        # Return in the format expected by frontend
        return {
            "success": True,
            "data": {
                "recommendations": [
                    {
                        "course": {
                            "id": rec.course.id,
                            "title": rec.course.title,
                            "description": rec.course.description,
                            "level": rec.course.level,
                            "category": rec.course.category,
                            "tags": rec.course.tags,
                            "price": rec.course.price,
                            "rating": rec.course.rating,
                            "students_count": rec.course.students_count,
                            "instructor": rec.course.instructor,
                            "image_url": str(rec.course.image_url) if rec.course.image_url else None,
                            "created_at": rec.course.created_at,
                            "updated_at": rec.course.updated_at
                        },
                        "confidence_score": rec.confidence_score,
                        "reasoning": rec.reasoning,
                        "match_type": rec.match_type,
                        "metadata": rec.metadata
                    } for rec in response.recommendations
                ],
                "query": response.query,
                "intent": {
                    "level": response.intent.level,
                    "keywords": response.intent.keywords,
                    "topics": response.intent.topics,
                    "intent_type": response.intent.intent_type
                },
                "match_type": response.match_type,
                "timestamp": response.timestamp
            }
        }
        
    except HTTPException as he:
        return {
            "success": False,
            "error": he.detail
        }
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": f"Failed to generate recommendations: {str(e)}"
        }
# ------------ Backend-Compatible Recommendation Endpoint ------------
@app.post(
    "/api/recommendations/backend",
    response_model=Dict[str, Any],
    tags=["Backend Integration"],
    responses={
        200: {"description": "Successfully generated recommendations in backend format"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_recommendations_backend_format(request_data: Dict[str, Any]):
    """
    Get course recommendations in the format expected by the backend service.
    
    This endpoint adapts our internal recommendation format to match the
    backend's expected IntentRequest/EngineResponse interface.
    """
    try:
        logger.info(f"Received backend recommendation request: {request_data}")
        
        # Convert backend request to our internal format
        internal_request = RecommendationRequest(
            user_query=request_data.get("query", ""),
            ui_chips=request_data.get("chips", []),
            user_id=request_data.get("userContext", {}).get("userId"),
            max_results=request_data.get("max_results", 5),
            min_confidence=0.4  # Lower threshold for backend compatibility
        )
        
        # Get recommendations using our service
        internal_response = await recommendation_service.get_recommendations(internal_request)
        
        # Convert to backend-expected format
        backend_recommendations = []
        
        for rec in internal_response.recommendations:
            backend_rec = {
                "course_stub": rec.course.id,
                "title": rec.course.title,
                "level": rec.course.level,
                "match_type": rec.match_type,
                "confidence": rec.confidence_score,
                "reasoning": rec.reasoning,
                "features": getattr(rec.course, 'features', []) or ["Certificate", "Expert Instruction"],
                "persuasive_copy": f"{rec.course.description[:200]}..." if len(rec.course.description) > 200 else rec.course.description
            }
            backend_recommendations.append(backend_rec)
        
        # Format response for backend
        backend_response = {
            "success": True,
            "data": {
                "intent": internal_response.intent.intent_type or "learn",
                "match_summary": internal_response.match_type,
                "recommendations": backend_recommendations
            },
            "meta": {
                "timestamp": internal_response.timestamp,
                "total_results": len(backend_recommendations),
                "query": internal_response.query
            }
        }
        
        logger.info(f"Generated {len(backend_recommendations)} recommendations for backend")
        return backend_response
        
    except Exception as e:
        logger.error(f"Error generating backend recommendations: {str(e)}", exc_info=True)
        
        # Return error in backend format
        return {
            "success": False,
            "data": {
                "intent": "unknown",
                "match_summary": "fallback",
                "recommendations": []
            },
            "error": str(e),
            "meta": {
                "timestamp": datetime.utcnow().isoformat()
            }
        }
@app.post(
    "/api/ingest-catalog",
    response_model=Dict[str, Any],
    tags=["Data Management"],
    responses={
        200: {"description": "Course catalog ingestion started"},
        500: {"model": ErrorResponse, "description": "Failed to start ingestion"}
    }
)
async def ingest_course_catalog(background_tasks: BackgroundTasks):
    """
    Manually trigger course catalog ingestion from PDF.
    This will process the course catalog PDF and update the vector store.
    """
    try:
        # Add background task to process the catalog
        background_tasks.add_task(process_catalog_background)
        
        return {
            "success": True,
            "message": "Course catalog ingestion started in background",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to start catalog ingestion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start catalog ingestion: {str(e)}"
        )

async def process_catalog_background():
    """Background task to process the course catalog."""
    try:
        logger.info("Starting background catalog processing...")
        
        pdf_path = os.path.join(os.path.dirname(__file__), '../data/course-catalog.pdf')
        
        if os.path.exists(pdf_path):
            courses = await data_ingestion_service.process_catalog(pdf_path)
            
            if courses:
                await vector_store.add_courses(courses)
                logger.info(f"Background task completed: processed {len(courses)} courses")
            else:
                logger.warning("Background task: no courses extracted from PDF")
        else:
            logger.warning(f"Background task: PDF not found at {pdf_path}")
            
    except Exception as e:
        logger.error(f"Background catalog processing failed: {e}")

async def process_json_catalog_background():
    """Background task to process JSON catalog."""
    try:
        logger.info("Starting background JSON catalog processing...")
        
        json_path = os.path.join(os.path.dirname(__file__), '../data/courses.json')
        
        if os.path.exists(json_path):
            courses = await data_ingestion_service.process_json_catalog(json_path)
            
            if courses:
                await vector_store.add_courses(courses)
                logger.info(f"Background task completed: processed {len(courses)} courses from JSON")
            else:
                logger.warning("Background task: no courses extracted from JSON")
        else:
            logger.warning(f"Background task: JSON not found at {json_path}")
            
    except Exception as e:
        logger.error(f"Background JSON catalog processing failed: {e}")

@app.post(
    "/api/ingest-json-catalog",
    response_model=Dict[str, Any],
    tags=["Data Management"],
    responses={
        200: {"description": "JSON course catalog ingestion started"},
        500: {"model": ErrorResponse, "description": "Failed to start ingestion"}
    }
)
async def ingest_json_course_catalog(background_tasks: BackgroundTasks):
    """
    Manually trigger course catalog ingestion from JSON file.
    This will process the courses.json file and update the vector store.
    """
    try:
        # Add background task to process the JSON catalog
        background_tasks.add_task(process_json_catalog_background)
        
        return {
            "success": True,
            "message": "JSON course catalog ingestion started in background",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to start JSON catalog ingestion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start JSON catalog ingestion: {str(e)}"
        )

# ------------ Vector Store Status Endpoint ------------
@app.get(
    "/api/vector-store/status",
    response_model=Dict[str, Any],
    tags=["Data Management"]
)
async def vector_store_status():
    """Get the current status of the vector store."""
    try:
        if not vector_store.is_initialized:
            return {
                "initialized": False,
                "document_count": 0,
                "message": "Vector store not initialized"
            }
        
        count = vector_store.collection.count()
        
        return {
            "initialized": True,
            "document_count": count,
            "collection_name": settings.CHROMA_COLLECTION,
            "chroma_host": settings.CHROMA_HOST,
            "chroma_port": settings.CHROMA_PORT
        }
        
    except Exception as e:
        logger.error(f"Failed to get vector store status: {e}")
        return {
            "initialized": False,
            "document_count": 0,
            "error": str(e)
        }

# ------------ Error Handlers ------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ------------ Main Entry Point ------------
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8003)),
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )
