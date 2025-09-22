import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import random

from ..models.recommendation import (
    Course, UserIntent, RecommendationItem, 
    RecommendationRequest, RecommendationResponse
)
from .model_service import model_service
from .vector_store import vector_store
from ..config import settings

logger = logging.getLogger(__name__)

class RecommendationService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RecommendationService, cls).__new__(cls)
        return cls._instance
    
    async def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """Get course recommendations based on user query.
        
        Args:
            request: The recommendation request object
            
        Returns:
            RecommendationResponse containing the recommendations
        """
        logger.info(f"Processing recommendation request: {request.user_query}")
        
        # Combine query with UI chips for enhanced search
        enhanced_query = " ".join([request.user_query] + request.ui_chips)
        logger.info(f"Enhanced query: {enhanced_query}")
        
        # Parse user intent using the model service
        try:
            intent_dict = await model_service.parse_intent(enhanced_query)
            intent = UserIntent(**intent_dict)
            logger.info(f"Parsed intent: {intent}")
        except Exception as e:
            logger.warning(f"Intent parsing failed, using fallback: {e}")
            intent = self._create_fallback_intent(enhanced_query)
        
        # Search for courses using vector similarity
        similar_results = await vector_store.search_similar_courses(
            query=enhanced_query,
            k=request.max_results * 2,  # Get more results to filter later
            min_score=0.0  # Allow all results for now, we'll filter later
        )
        
        if similar_results:
            logger.info(f"Found {len(similar_results)} vector search results")
            
            # Convert to RecommendationItems and determine match types
            recommendations = await self._process_vector_results(
                similar_results, 
                intent, 
                request.max_results,
                request.min_confidence
            )
            
            if recommendations:
                # Determine overall match type
                match_type = self._determine_overall_match_type(recommendations)
                
                return self._format_response(
                    query=request.user_query,
                    intent=intent,
                    recommendations=recommendations,
                    match_type=match_type
                )
        
        # Final fallback - create generic recommendations
        logger.info("Using fallback recommendations")
        fallback_recommendations = await self._generate_fallback_recommendations(intent, request.max_results)
        
        return self._format_response(
            query=request.user_query,
            intent=intent,
            recommendations=fallback_recommendations,
            match_type="fallback"
        )
    
    def _create_fallback_intent(self, query: str) -> UserIntent:
        """Create a fallback intent when parsing fails."""
        query_lower = query.lower()
        
        # Extract basic information
        level = "beginner"
        if any(word in query_lower for word in ["advanced", "expert", "master"]):
            level = "advanced"
        elif any(word in query_lower for word in ["intermediate", "medium"]):
            level = "intermediate"
        
        # Extract basic keywords
        tech_keywords = [
            "python", "javascript", "java", "nodejs", "react", "angular", "vue",
            "backend", "frontend", "fullstack", "api", "database", "web", "mobile"
        ]
        
        keywords = [kw for kw in tech_keywords if kw in query_lower]
        
        return UserIntent(
            level=level,
            keywords=keywords,
            topics=keywords,
            intent_type="learn"
        )
    
    async def _process_vector_results(
        self, 
        results: List[Dict[str, Any]], 
        intent: UserIntent,
        max_results: int,
        min_confidence: float
    ) -> List[RecommendationItem]:
        """Process vector search results into recommendation items."""
        recommendations = []
        
        for result in results:
            try:
                # Create Course object
                course = Course(
                    id=result['id'],
                    title=result['title'],
                    description=result.get('document', ''),
                    level=result.get('level', 'beginner'),
                    category=result.get('category', 'General'),
                    tags=result.get('tags', []),
                    price=float(result.get('price', 0)),
                    rating=float(result.get('rating', 0)),
                    students_count=int(result.get('students_count', 0)),
                    instructor=result.get('instructor', 'Expert Instructor')
                )
                
                # Calculate confidence and match type
                base_score = result.get('score', 0)
                confidence, match_type = self._calculate_match_details(course, intent, base_score)
                
                if confidence >= min_confidence:
                    # Generate reasoning
                    reasoning = self._generate_reasoning(course, intent, match_type, confidence)
                    
                    recommendation = RecommendationItem(
                        course=course,
                        confidence_score=confidence,
                        reasoning=reasoning,
                        match_type=match_type,
                        metadata={
                            'original_score': base_score,
                            'search_rank': len(recommendations) + 1
                        }
                    )
                    
                    recommendations.append(recommendation)
                
                if len(recommendations) >= max_results:
                    break
                    
            except Exception as e:
                logger.error(f"Error processing result {result.get('id', 'unknown')}: {e}")
                continue
        
        return recommendations
    
    def _calculate_match_details(self, course: Course, intent: UserIntent, base_score: float) -> tuple[float, str]:
        """Calculate confidence score and match type based on course and intent."""
        confidence = base_score
        match_type = "similar"
        
        # Check for exact matches
        exact_score_boost = 0
        
        # Level match
        if intent.level and intent.level.lower() == course.level.lower():
            exact_score_boost += 0.2
        
        # Keyword matches in title
        course_title_lower = course.title.lower()
        for keyword in intent.keywords:
            if keyword.lower() in course_title_lower:
                exact_score_boost += 0.15
        
        # Topic matches in tags
        for topic in intent.topics:
            if any(topic.lower() == tag.lower() for tag in course.tags):
                exact_score_boost += 0.1
        
        # Apply boost
        confidence = min(1.0, base_score + exact_score_boost)
        
        # Determine match type
        if exact_score_boost >= 0.3:
            match_type = "exact"
        elif base_score >= 0.7:
            match_type = "similar"
        else:
            match_type = "fallback"
        
        return confidence, match_type
    
    def _generate_reasoning(self, course: Course, intent: UserIntent, match_type: str, confidence: float) -> str:
        """Generate human-readable reasoning for the recommendation."""
        reasons = []
        
        if match_type == "exact":
            if intent.level and intent.level.lower() == course.level.lower():
                reasons.append(f"perfect match for {intent.level} level")
            
            for keyword in intent.keywords:
                if keyword.lower() in course.title.lower():
                    reasons.append(f"covers {keyword}")
        
        elif match_type == "similar":
            reasons.append(f"highly relevant to your interests ({confidence*100:.0f}% match)")
            if course.rating and course.rating > 4.5:
                reasons.append("excellent student ratings")
        
        else:  # fallback
            if course.rating and course.rating > 4.0:
                reasons.append("popular course with good ratings")
            reasons.append("builds fundamental skills")
        
        if not reasons:
            reasons.append("recommended based on your query")
        
        return ", ".join(reasons)
    
    def _determine_overall_match_type(self, recommendations: List[RecommendationItem]) -> str:
        """Determine the overall match type for the recommendation set."""
        if not recommendations:
            return "fallback"
        
        exact_count = sum(1 for r in recommendations if r.match_type == "exact")
        similar_count = sum(1 for r in recommendations if r.match_type == "similar")
        
        if exact_count > 0:
            return "exact"
        elif similar_count > len(recommendations) / 2:
            return "similar"
        else:
            return "fallback"
    
    async def _generate_fallback_recommendations(self, intent: UserIntent, max_results: int) -> List[RecommendationItem]:
        """Generate fallback recommendations when no vector results are found."""
        logger.info("Generating fallback recommendations")
        
        # Get some basic courses from vector store
        fallback_results = await vector_store.search_similar_courses(
            query="programming web development backend",
            k=max_results * 2,
            min_score=0.0
        )
        
        if fallback_results:
            recommendations = []
            for result in fallback_results[:max_results]:
                try:
                    course = Course(
                        id=result['id'],
                        title=result['title'],
                        description=result.get('document', 'Learn essential skills'),
                        level=result.get('level', 'beginner'),
                        category=result.get('category', 'General'),
                        tags=result.get('tags', []),
                        price=float(result.get('price', 1299)),
                        rating=float(result.get('rating', 4.5)),
                        students_count=int(result.get('students_count', 1000)),
                        instructor=result.get('instructor', 'Expert Instructor')
                    )
                    
                    recommendation = RecommendationItem(
                        course=course,
                        confidence_score=0.6,  # Lower confidence for fallback
                        reasoning="Popular course with good fundamentals",
                        match_type="fallback"
                    )
                    
                    recommendations.append(recommendation)
                    
                except Exception as e:
                    logger.error(f"Error creating fallback recommendation: {e}")
                    continue
            
            return recommendations
        
        # Last resort: hardcoded fallback
        return self._create_hardcoded_fallback(max_results)
    
    def _create_hardcoded_fallback(self, max_results: int) -> List[RecommendationItem]:
        """Create hardcoded fallback recommendations as last resort."""
        fallback_courses = [
            {
                'id': 'fallback-backend',
                'title': 'Backend Development Fundamentals',
                'description': 'Learn the core concepts of backend development applicable to any technology stack.',
                'level': 'beginner',
                'category': 'Programming',
                'price': 1299.0
            },
            {
                'id': 'fallback-web',
                'title': 'Web Development Complete Course',
                'description': 'Full-stack web development covering both frontend and backend technologies.',
                'level': 'intermediate',
                'category': 'Web Development',
                'price': 1899.0
            }
        ]
        
        recommendations = []
        for course_data in fallback_courses[:max_results]:
            course = Course(
                id=course_data['id'],
                title=course_data['title'],
                description=course_data['description'],
                level=course_data['level'],
                category=course_data['category'],
                tags=[],
                price=course_data['price'],
                rating=4.5,
                students_count=1000,
                instructor='Expert Instructor'
            )
            
            recommendation = RecommendationItem(
                course=course,
                confidence_score=0.5,
                reasoning="Foundational course to build essential skills",
                match_type="fallback"
            )
            
            recommendations.append(recommendation)
        
        return recommendations
    
    def _format_response(
        self,
        query: str,
        intent: UserIntent,
        recommendations: List[RecommendationItem],
        match_type: str
    ) -> RecommendationResponse:
        """Format the recommendation response."""
        return RecommendationResponse(
            query=query,
            intent=intent,
            recommendations=recommendations,
            match_type=match_type,
            timestamp=datetime.utcnow().isoformat()
        )

# Singleton instance
recommendation_service = RecommendationService()

# Singleton instance
recommendation_service = RecommendationService()
