import chromadb
from typing import List, Dict, Any, Optional
import logging
import os
import json
from ..config import settings

logger = logging.getLogger(__name__)

class VectorStoreService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStoreService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self.client = None
            self.collection = None
            self.is_initialized = False
            self._initialized = True
    
    async def initialize(self):
        """Initialize the ChromaDB client and collection."""
        try:
            self.client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT
            )
            logger.info(f"Connected to ChromaDB at {settings.CHROMA_HOST}:{settings.CHROMA_PORT}")
            
            # Get or create the collection
            self.collection = self.client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"Using collection: {settings.CHROMA_COLLECTION}")
            
            # Check if we need to ingest data
            count = self.collection.count()
            logger.info(f"Collection has {count} documents")
            
            if count == 0:
                await self._load_course_data()
            
            self.is_initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.is_initialized = False
    
    async def _load_course_data(self):
        """Load course data into the vector store if not already loaded."""
        try:
            # Check for processed course data
            data_path = os.path.join(os.path.dirname(__file__), '../../data/processed_courses.json')
            
            if os.path.exists(data_path):
                logger.info("Loading processed course data...")
                with open(data_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                courses = data.get('courses', [])
                if courses:
                    await self.add_courses(courses)
                    logger.info(f"Loaded {len(courses)} courses into vector store")
                else:
                    logger.warning("No courses found in processed data")
            else:
                logger.warning(f"Processed course data not found at {data_path}")
                await self._create_sample_data()
                
        except Exception as e:
            logger.error(f"Failed to load course data: {e}")
            await self._create_sample_data()
    
    async def _create_sample_data(self):
        """Create sample course data if no processed data is available."""
        logger.info("Creating sample course data...")
        
        sample_courses = [
            {
                'id': 'nodejs-backend-complete',
                'title': 'Complete Node.js Backend Development',
                'description': 'Master backend development with Node.js, Express, MongoDB, and deployment. Build production-ready APIs with authentication, validation, and best practices.',
                'level': 'intermediate',
                'category': 'Backend Development',
                'tags': ['nodejs', 'backend', 'api', 'express', 'mongodb', 'javascript'],
                'price': 1899.0,
                'rating': 4.8,
                'students_count': 2547,
                'instructor': 'Expert Developer',
                'topics': ['Express.js Framework', 'MongoDB Integration', 'Authentication & Authorization', 'API Design', 'Error Handling', 'Testing'],
                'features': ['Certificate', 'Hands-on Projects', 'Mentor Support', 'Lifetime Access'],
                'embedding_text': 'Complete Node.js Backend Development Master backend development with Node.js, Express, MongoDB, and deployment Express.js Framework MongoDB Integration Authentication Authorization API Design nodejs backend api express mongodb javascript'
            },
            {
                'id': 'backend-design-principles',
                'title': 'Backend System Design & Architecture',
                'description': 'Learn fundamental backend patterns, system design principles, and scalable architecture patterns that work across all programming languages and frameworks.',
                'level': 'beginner',
                'category': 'System Design',
                'tags': ['backend', 'system-design', 'architecture', 'scalability', 'patterns', 'apis'],
                'price': 1599.0,
                'rating': 4.6,
                'students_count': 1823,
                'instructor': 'System Architect',
                'topics': ['System Architecture', 'Database Design', 'API Patterns', 'Caching Strategies', 'Load Balancing', 'Microservices'],
                'features': ['Certificate', 'System Design Basics', 'Scalable Patterns', 'Architecture Diagrams'],
                'embedding_text': 'Backend System Design Architecture Learn fundamental backend patterns system design principles scalable architecture System Architecture Database Design API Patterns Caching Strategies backend system-design architecture scalability patterns apis'
            },
            {
                'id': 'python-backend-fundamentals',
                'title': 'Python Backend Development Fundamentals',
                'description': 'Build robust backend systems using Python, Django/Flask, PostgreSQL, and modern deployment practices. Perfect for backend engineering roles.',
                'level': 'beginner',
                'category': 'Backend Development',
                'tags': ['python', 'backend', 'django', 'flask', 'postgresql', 'apis'],
                'price': 1699.0,
                'rating': 4.7,
                'students_count': 3241,
                'instructor': 'Python Expert',
                'topics': ['Python Web Frameworks', 'Database Integration', 'RESTful APIs', 'Authentication', 'Testing', 'Deployment'],
                'features': ['Certificate', 'Hands-on Projects', 'Industry Projects', 'Job Support'],
                'embedding_text': 'Python Backend Development Fundamentals Build robust backend systems using Python Django Flask PostgreSQL Python Web Frameworks Database Integration RESTful APIs python backend django flask postgresql apis'
            },
            {
                'id': 'javascript-fullstack',
                'title': 'JavaScript Full-Stack Development',
                'description': 'Complete JavaScript development course covering both frontend and backend. Learn React, Node.js, Express, and modern JavaScript practices.',
                'level': 'intermediate',
                'category': 'Full-Stack Development',
                'tags': ['javascript', 'react', 'nodejs', 'fullstack', 'express', 'frontend', 'backend'],
                'price': 2199.0,
                'rating': 4.9,
                'students_count': 4156,
                'instructor': 'JavaScript Guru',
                'topics': ['Modern JavaScript', 'React Development', 'Node.js & Express', 'State Management', 'API Integration', 'Full-Stack Projects'],
                'features': ['Certificate', 'Portfolio Projects', 'Job Assistance', 'Lifetime Updates'],
                'embedding_text': 'JavaScript Full-Stack Development Complete JavaScript development course covering frontend backend React Node.js Express Modern JavaScript React Development Node.js Express State Management javascript react nodejs fullstack express frontend backend'
            },
            {
                'id': 'data-structures-algorithms',
                'title': 'Data Structures & Algorithms Mastery',
                'description': 'Master computer science fundamentals with comprehensive coverage of data structures and algorithms. Essential for technical interviews and backend development.',
                'level': 'intermediate',
                'category': 'Computer Science',
                'tags': ['algorithms', 'data-structures', 'problem-solving', 'interview-prep', 'computer-science'],
                'price': 1799.0,
                'rating': 4.8,
                'students_count': 2891,
                'instructor': 'CS Professor',
                'topics': ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching', 'System Design Basics', 'Interview Practice'],
                'features': ['Certificate', 'Interview Preparation', 'Practice Problems', 'Mock Interviews'],
                'embedding_text': 'Data Structures Algorithms Mastery Master computer science fundamentals comprehensive coverage data structures algorithms Arrays Strings Trees Graphs Dynamic Programming algorithms data-structures problem-solving interview-prep computer-science'
            }
        ]
        
        await self.add_courses(sample_courses)
        logger.info(f"Created {len(sample_courses)} sample courses")
    
    async def add_courses(self, courses: List[Dict[str, Any]]) -> bool:
        """Add course documents to the vector store.
        
        Args:
            courses: List of course dictionaries with embeddings
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.is_initialized or not self.collection:
            logger.error("Vector store not initialized")
            return False
            
        try:
            # Prepare data for ChromaDB
            ids = []
            embeddings = []
            metadatas = []
            documents = []
            
            for course in courses:
                ids.append(course['id'])
                
                # Use embedding if available, otherwise create a dummy one
                if 'embedding' in course and course['embedding']:
                    embeddings.append(course['embedding'])
                else:
                    # Create a simple dummy embedding for demonstration
                    embeddings.append([0.0] * 384)
                
                # Prepare metadata
                metadata = {
                    'title': course.get('title', ''),
                    'level': course.get('level', ''),
                    'category': course.get('category', ''),
                    'price': course.get('price', 0),
                    'rating': course.get('rating', 0),
                    'students_count': course.get('students_count', 0),
                    'instructor': course.get('instructor', ''),
                    'tags': ','.join(course.get('tags', [])),
                    'features': ','.join(course.get('features', []))
                }
                metadatas.append(metadata)
                
                # Document content for search
                document_text = course.get('embedding_text', course.get('description', ''))
                documents.append(document_text)
            
            # Add to ChromaDB
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                metadatas=metadatas,
                documents=documents
            )
            
            logger.info(f"Added {len(courses)} courses to vector store")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add courses to vector store: {e}")
            return False
    
    async def search_similar_courses(
        self, 
        query: str, 
        k: int = 5, 
        min_score: float = 0.0,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar courses based on a query.
        
        Args:
            query: The search query
            k: Number of results to return
            min_score: Minimum similarity score (0-1)
            filter_conditions: Optional filters to apply
            
        Returns:
            List of matching courses with scores
        """
        if not self.is_initialized or not self.collection:
            logger.error("Vector store not initialized")
            return []
            
        try:
            # Search in ChromaDB using text query
            results = self.collection.query(
                query_texts=[query],
                n_results=k,
                where=filter_conditions
            )
            
            # Process results
            matches = []
            if results['ids'] and results['ids'][0]:
                for i, doc_id in enumerate(results['ids'][0]):
                    # Convert distance to similarity score
                    distance = results['distances'][0][i] if results['distances'] and results['distances'][0] else 0
                    score = max(0, 1.0 - distance)  # Convert distance to similarity
                    
                    if score >= min_score:
                        metadata = results['metadatas'][0][i] if results['metadatas'] and results['metadatas'][0] else {}
                        
                        course_data = {
                            'id': doc_id,
                            'score': score,
                            'title': metadata.get('title', ''),
                            'level': metadata.get('level', ''),
                            'category': metadata.get('category', ''),
                            'price': metadata.get('price', 0),
                            'rating': metadata.get('rating', 0),
                            'students_count': metadata.get('students_count', 0),
                            'instructor': metadata.get('instructor', ''),
                            'tags': metadata.get('tags', '').split(',') if metadata.get('tags') else [],
                            'features': metadata.get('features', '').split(',') if metadata.get('features') else [],
                            'document': results['documents'][0][i] if results['documents'] and results['documents'][0] else '',
                            'metadata': metadata
                        }
                        matches.append(course_data)
            
            # Sort by score in descending order
            matches.sort(key=lambda x: x['score'], reverse=True)
            
            logger.info(f"Found {len(matches)} matches for query: {query}")
            return matches
            
        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            return []

# Backward compatibility
async def search_similar(query: str, k: int = 5, min_score: float = 0.6, filter_conditions: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Backward compatibility wrapper."""
    return await vector_store.search_similar_courses(query, k, min_score, filter_conditions)

# Singleton instance
vector_store = VectorStoreService()
