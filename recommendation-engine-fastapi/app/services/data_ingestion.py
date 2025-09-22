import os
import logging
from typing import List, Dict, Any, Optional
import PyPDF2
import pdfplumber
import re
import json
from datetime import datetime
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class DataIngestionService:
    """Service to ingest and process course catalog data."""
    
    def __init__(self):
        self.embedding_model = None
        self.course_data = []
        
    async def initialize(self):
        """Initialize the embedding model."""
        try:
            logger.info("Initializing embedding model for data ingestion...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Data ingestion service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize data ingestion service: {e}")
            raise
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text content from a PDF file."""
        try:
            text_content = ""
            
            # Try with pdfplumber first (better for structured PDFs)
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content += page_text + "\n"
            
            if not text_content.strip():
                # Fallback to PyPDF2
                with open(pdf_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text_content += page.extract_text() + "\n"
            
            return text_content.strip()
            
        except Exception as e:
            logger.error(f"Failed to extract text from PDF {pdf_path}: {e}")
            return ""
    
    def parse_course_catalog(self, text_content: str) -> List[Dict[str, Any]]:
        """Parse course information from the extracted text."""
        courses = []
        
        try:
            # Split text into sections (assuming courses are separated by certain patterns)
            course_sections = self._split_into_courses(text_content)
            
            for i, section in enumerate(course_sections):
                course_info = self._extract_course_info(section, i)
                if course_info:
                    courses.append(course_info)
            
            logger.info(f"Parsed {len(courses)} courses from catalog")
            return courses
            
        except Exception as e:
            logger.error(f"Failed to parse course catalog: {e}")
            return []
    
    def _split_into_courses(self, text: str) -> List[str]:
        """Split text into individual course sections."""
        # Look for patterns that indicate course boundaries
        patterns = [
            r'(?=Course\s*\d+:)',  # "Course 1:", "Course 2:", etc.
            r'(?=\d+\.\s+[A-Z])',  # "1. Python", "2. JavaScript", etc.
            r'(?=\n[A-Z][^a-z\n]*(?:Course|Program|Training|Bootcamp))',  # All caps course titles
            r'(?=\n\d+\.\s*[A-Z])',  # Numbered list items
        ]
        
        sections = []
        for pattern in patterns:
            matches = re.split(pattern, text)
            if len(matches) > 1:
                sections = [match.strip() for match in matches if match.strip()]
                break
        
        # If no patterns match, try to split by common course indicators
        if not sections:
            sections = self._fallback_split(text)
        
        return sections
    
    def _fallback_split(self, text: str) -> List[str]:
        """Fallback method to split text when patterns don't match."""
        # Split by paragraphs and group them
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        # Group paragraphs into course sections (simple heuristic)
        sections = []
        current_section = ""
        
        for para in paragraphs:
            if len(para) > 200 and any(keyword in para.lower() for keyword in ['course', 'learn', 'master', 'beginner', 'advanced']):
                if current_section:
                    sections.append(current_section)
                current_section = para
            else:
                current_section += "\n\n" + para if current_section else para
        
        if current_section:
            sections.append(current_section)
        
        return sections
    
    def _extract_course_info(self, text: str, index: int) -> Optional[Dict[str, Any]]:
        """Extract structured information from a course section."""
        try:
            # Extract course name (usually the first line or after a number)
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            if not lines:
                return None
            
            title = self._extract_title(lines)
            if not title:
                title = f"Course {index + 1}"
            
            # Extract other information
            price = self._extract_price(text)
            level = self._extract_level(text)
            duration = self._extract_duration(text)
            description = self._extract_description(text)
            topics = self._extract_topics(text)
            features = self._extract_features(text)
            
            # Generate tags from content
            tags = self._generate_tags(title, description, topics)
            
            return {
                'id': f"course_{index + 1}",
                'title': title,
                'description': description,
                'level': level,
                'price': price,
                'duration': duration,
                'topics': topics,
                'features': features,
                'tags': tags,
                'full_content': text,
                'category': self._infer_category(title, description, topics)
            }
            
        except Exception as e:
            logger.error(f"Failed to extract course info from section: {e}")
            return None
    
    def _extract_title(self, lines: List[str]) -> str:
        """Extract course title from lines."""
        for line in lines:
            # Remove common prefixes
            clean_line = re.sub(r'^(\d+\.?\s*|Course\s*\d*:?\s*)', '', line, flags=re.IGNORECASE).strip()
            if clean_line and len(clean_line) > 5:
                return clean_line
        return lines[0] if lines else "Untitled Course"
    
    def _extract_price(self, text: str) -> float:
        """Extract price from text."""
        # Look for price patterns
        price_patterns = [
            r'₹\s*(\d+(?:,\d+)*)',  # ₹1,299
            r'INR\s*(\d+(?:,\d+)*)',  # INR 1299
            r'Rs\.?\s*(\d+(?:,\d+)*)',  # Rs. 1299
            r'\$\s*(\d+(?:,\d+)*)',  # $99
            r'(\d+(?:,\d+)*)\s*(?:rupees|INR|₹)',  # 1299 rupees
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                price_str = match.group(1).replace(',', '')
                try:
                    return float(price_str)
                except ValueError:
                    continue
        
        # Default price if not found
        return 1299.0
    
    def _extract_level(self, text: str) -> str:
        """Extract difficulty level from text."""
        text_lower = text.lower()
        if any(word in text_lower for word in ['beginner', 'basic', 'intro', 'foundation']):
            return 'beginner'
        elif any(word in text_lower for word in ['advanced', 'expert', 'master']):
            return 'advanced'
        elif any(word in text_lower for word in ['intermediate', 'medium']):
            return 'intermediate'
        return 'beginner'  # Default
    
    def _extract_duration(self, text: str) -> Optional[str]:
        """Extract course duration from text."""
        duration_patterns = [
            r'(\d+)\s*(?:weeks?|months?|days?|hours?)',
            r'Duration:\s*([^\n]+)',
            r'Time:\s*([^\n]+)',
        ]
        
        for pattern in duration_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    def _extract_description(self, text: str) -> str:
        """Extract course description."""
        # Take the first substantial paragraph that's not the title
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        description_lines = []
        for line in lines[1:]:  # Skip the first line (likely title)
            if len(line) > 20 and not re.match(r'^\d+\.', line):
                description_lines.append(line)
                if len(' '.join(description_lines)) > 200:
                    break
        
        description = ' '.join(description_lines)
        return description[:500] + "..." if len(description) > 500 else description
    
    def _extract_topics(self, text: str) -> List[str]:
        """Extract course topics/modules."""
        topics = []
        
        # Look for bullet points, numbered lists, etc.
        patterns = [
            r'[•·▪▫]\s*([^\n]+)',  # Bullet points
            r'\d+\.\s*([^\n]+)',  # Numbered items
            r'Topics?:\s*([^\n]+)',  # "Topics:" followed by list
            r'Modules?:\s*([^\n]+)',  # "Modules:" followed by list
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            topics.extend([match.strip() for match in matches])
        
        # Clean and deduplicate
        cleaned_topics = []
        for topic in topics:
            topic = re.sub(r'^[•·▪▫\d\.\s-]+', '', topic).strip()
            if topic and len(topic) > 3 and topic not in cleaned_topics:
                cleaned_topics.append(topic[:100])  # Limit length
        
        return cleaned_topics[:10]  # Limit to top 10
    
    def _extract_features(self, text: str) -> List[str]:
        """Extract course features/benefits."""
        features = []
        
        # Common feature indicators
        feature_keywords = [
            'certificate', 'certification', 'hands-on', 'projects', 'mentorship',
            'support', 'lifetime access', 'refund', 'bootcamp', 'workshop'
        ]
        
        text_lower = text.lower()
        for keyword in feature_keywords:
            if keyword in text_lower:
                features.append(keyword.title())
        
        # Look for explicit feature lists
        feature_patterns = [
            r'Features?:\s*([^\n]+)',
            r'Benefits?:\s*([^\n]+)',
            r'Includes?:\s*([^\n]+)',
        ]
        
        for pattern in feature_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                features.extend([f.strip() for f in match.split(',') if f.strip()])
        
        return list(set(features))[:5]  # Limit and deduplicate
    
    def _generate_tags(self, title: str, description: str, topics: List[str]) -> List[str]:
        """Generate tags from course content."""
        combined_text = f"{title} {description} {' '.join(topics)}".lower()
        
        # Technology keywords
        tech_keywords = [
            'python', 'javascript', 'java', 'node.js', 'react', 'angular', 'vue',
            'django', 'flask', 'spring', 'html', 'css', 'sql', 'mongodb',
            'aws', 'azure', 'docker', 'kubernetes', 'git', 'api', 'rest',
            'graphql', 'microservices', 'database', 'frontend', 'backend',
            'fullstack', 'mobile', 'android', 'ios', 'machine learning',
            'data science', 'artificial intelligence', 'blockchain', 'devops'
        ]
        
        tags = []
        for keyword in tech_keywords:
            if keyword in combined_text:
                tags.append(keyword)
        
        return tags[:8]  # Limit to 8 tags
    
    def _infer_category(self, title: str, description: str, topics: List[str]) -> str:
        """Infer course category."""
        combined_text = f"{title} {description} {' '.join(topics)}".lower()
        
        categories = {
            'Programming': ['python', 'javascript', 'java', 'programming', 'coding', 'software'],
            'Web Development': ['html', 'css', 'react', 'angular', 'vue', 'web', 'frontend', 'backend'],
            'Data Science': ['data', 'analytics', 'machine learning', 'ai', 'statistics', 'pandas'],
            'Mobile Development': ['android', 'ios', 'mobile', 'app development', 'flutter', 'react native'],
            'Cloud & DevOps': ['aws', 'azure', 'cloud', 'docker', 'kubernetes', 'devops', 'ci/cd'],
            'Business': ['management', 'business', 'marketing', 'strategy', 'entrepreneurship'],
            'Design': ['ui', 'ux', 'design', 'figma', 'photoshop', 'graphics']
        }
        
        for category, keywords in categories.items():
            if any(keyword in combined_text for keyword in keywords):
                return category
        
        return 'General'
    
    async def generate_embeddings(self, courses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate embeddings for course content."""
        if not self.embedding_model:
            raise RuntimeError("Embedding model not initialized")
        
        enhanced_courses = []
        
        for course in courses:
            try:
                # Combine relevant text for embedding
                embedding_text = f"{course['title']} {course['description']} {' '.join(course['topics'])} {' '.join(course['tags'])}"
                
                # Generate embedding
                embedding = self.embedding_model.encode(
                    embedding_text,
                    convert_to_numpy=True,
                    normalize_embeddings=True
                )
                
                course_with_embedding = course.copy()
                course_with_embedding['embedding'] = embedding.tolist()
                course_with_embedding['embedding_text'] = embedding_text
                
                enhanced_courses.append(course_with_embedding)
                
            except Exception as e:
                logger.error(f"Failed to generate embedding for course {course.get('id', 'unknown')}: {e}")
                continue
        
        logger.info(f"Generated embeddings for {len(enhanced_courses)} courses")
        return enhanced_courses
    
    async def process_catalog(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Complete pipeline to process course catalog."""
        try:
            logger.info(f"Processing course catalog: {pdf_path}")
            
            # Initialize if not already done
            if not self.embedding_model:
                await self.initialize()
            
            # Extract text from PDF
            text_content = self.extract_text_from_pdf(pdf_path)
            if not text_content:
                logger.error("No text extracted from PDF")
                return []
            
            # Parse courses
            courses = self.parse_course_catalog(text_content)
            if not courses:
                logger.error("No courses parsed from text")
                return []
            
            # Generate embeddings
            enhanced_courses = await self.generate_embeddings(courses)
            
            # Save processed data
            await self._save_processed_data(enhanced_courses)
            
            logger.info(f"Successfully processed {len(enhanced_courses)} courses")
            return enhanced_courses
            
        except Exception as e:
            logger.error(f"Failed to process catalog: {e}")
            return []
    
    async def _save_processed_data(self, courses: List[Dict[str, Any]]) -> None:
        """Save processed course data to a JSON file."""
        try:
            output_path = os.path.join(os.path.dirname(__file__), '../../data/processed_courses.json')
            
            # Prepare data for JSON serialization
            json_data = {
                'processed_at': datetime.utcnow().isoformat(),
                'total_courses': len(courses),
                'courses': []
            }
            
            for course in courses:
                course_json = course.copy()
                # Convert numpy arrays to lists for JSON serialization
                if 'embedding' in course_json:
                    course_json['embedding'] = course_json['embedding']  # Already converted to list
                json_data['courses'].append(course_json)
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved processed course data to {output_path}")
            
        except Exception as e:
            logger.error(f"Failed to save processed data: {e}")

# Global instance
data_ingestion_service = DataIngestionService()