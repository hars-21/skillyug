import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from sentence_transformers import SentenceTransformer
import numpy as np
import spacy
from datetime import datetime
import json
from enum import Enum
from dataclasses import dataclass
import random

logger = logging.getLogger(__name__)

class IntentType(Enum):
    LEARN = "learn"
    BUILD = "build"
    EXPLORE = "explore"
    COMPARE = "compare"
    UNKNOWN = "unknown"

@dataclass
class ParsedIntent:
    intent_type: IntentType
    topics: List[str]
    level: str
    keywords: List[str]

class ModelService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the model service with required models."""
        self.embedding_model = None
        self.nlp = None
        self.is_initialized = False
        
        try:
            # Initialize embedding model
            logger.info("Loading embedding model...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize NLP pipeline for intent parsing
            logger.info("Loading NLP pipeline...")
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model 'en_core_web_sm' not found. Using basic text processing.")
                self.nlp = None
            
            # Load skill keywords and categories
            self._load_skill_keywords()
            
            logger.info("Model service initialized successfully")
            self.is_initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            self.is_initialized = False
    
    async def initialize(self):
        """Async initialization method."""
        if not self.is_initialized:
            self._initialize()
    
    def _load_skill_keywords(self):
        """Load skill keywords and categories from a JSON file."""
        try:
            # In a real implementation, load from a JSON file or database
            self.skill_keywords = {
                'programming': ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript'],
                'data_science': ['data science', 'machine learning', 'deep learning', 'ai', 'artificial intelligence', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
                'web_development': ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'express'],
                'mobile_development': ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin'],
                'cloud': ['aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'devops', 'ci/cd'],
                'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 'oracle'],
                'design': ['ui/ux', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator'],
                'business': ['project management', 'agile', 'scrum', 'product management', 'business analysis'],
                'marketing': ['digital marketing', 'seo', 'social media', 'content marketing', 'email marketing'],
            }
            
            # Create a reverse mapping for faster lookups
            self.keyword_to_category = {}
            for category, keywords in self.skill_keywords.items():
                for keyword in keywords:
                    self.keyword_to_category[keyword] = category
                    
        except Exception as e:
            logger.error(f"Failed to load skill keywords: {e}")
            self.skill_keywords = {}
            self.keyword_to_category = {}
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate an embedding for the given text.
        
        Args:
            text: The text to generate an embedding for
            
        Returns:
            List of floats representing the embedding
        """
        if not self.is_initialized or not self.embedding_model:
            raise RuntimeError("Model service not initialized")
        
        try:
            # Generate embedding using Sentence Transformers
            embedding = self.embedding_model.encode(
                text,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False
            )
            
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def parse_intent(self, text: str) -> Dict[str, Any]:
        """Parse user intent from the given text.
        
        Args:
            text: The user's input text
            
        Returns:
            Dictionary containing the parsed intent
        """
        try:
            if self.nlp:
                return await self._parse_with_nlp(text)
            else:
                return self._parse_with_fallback(text)
                
        except Exception as e:
            logger.error(f"Intent parsing failed: {e}")
            return self._parse_with_fallback(text)
    
    async def _parse_with_nlp(self, text: str) -> Dict[str, Any]:
        """Parse intent using spaCy NLP."""
        doc = self.nlp(text.lower())
        
        # Extract named entities and noun phrases
        entities = [ent.text for ent in doc.ents]
        noun_chunks = [chunk.text for chunk in doc.noun_chunks]
        
        # Extract tokens and their parts of speech
        tokens = [(token.text, token.pos_, token.lemma_) for token in doc]
        
        # Determine intent type
        intent_type = self._determine_intent_type(text, tokens)
        
        # Extract topics and keywords
        topics = self._extract_topics(entities, noun_chunks)
        keywords = self._extract_keywords(tokens, entities, noun_chunks)
        
        # Determine skill level
        level = self._determine_skill_level(text)
        
        return {
            'level': level,
            'keywords': keywords[:5],  # Limit keywords
            'topics': topics[:3],      # Limit topics
            'intent_type': intent_type.value
        }
    
    def _parse_with_fallback(self, text: str) -> Dict[str, Any]:
        """Simple fallback intent parsing without spaCy."""
        text_lower = text.lower()
        
        # Determine intent type based on keywords
        intent_type = IntentType.LEARN  # default
        if any(word in text_lower for word in ['build', 'create', 'develop', 'make']):
            intent_type = IntentType.BUILD
        elif any(word in text_lower for word in ['explore', 'discover', 'find out', 'check']):
            intent_type = IntentType.EXPLORE
        elif any(word in text_lower for word in ['compare', 'vs', 'versus', 'difference']):
            intent_type = IntentType.COMPARE
        
        # Extract level
        level = self._determine_skill_level(text)
        
        # Extract keywords using simple word matching
        tech_keywords = [kw for kw in self.keyword_to_category.keys() if kw in text_lower]
        
        # Extract topics from categories
        topics = []
        for keyword in tech_keywords:
            category = self.keyword_to_category.get(keyword)
            if category and category not in topics:
                topics.append(category)
        
        return {
            'level': level,
            'keywords': tech_keywords[:5],
            'topics': topics[:3],
            'intent_type': intent_type.value
        }
    
    def _determine_intent_type(self, text: str, tokens: List[tuple]) -> IntentType:
        """Determine the intent type from the text."""
        text_lower = text.lower()
        
        # Check for intent indicators
        if any(word in text_lower for word in ["how to", "learn", "tutorial", "guide"]):
            return IntentType.LEARN
        elif any(word in text_lower for word in ["build", "create", "make", "develop"]):
            return IntentType.BUILD
        elif any(word in text_lower for word in ["compare", "vs", "difference between"]):
            return IntentType.COMPARE
        elif any(word in text_lower for word in ["explore", "find", "search", "look for"]):
            return IntentType.EXPLORE
        
        # Default to LEARN if we can't determine the intent
        return IntentType.LEARN
    
    def _extract_topics(self, entities: List[str], noun_chunks: List[str]) -> List[str]:
        """Extract topics from entities and noun chunks."""
        topics = set()
        
        # Add entities as potential topics
        topics.update(entities)
        
        # Add noun chunks that are not too short or too common
        for chunk in noun_chunks:
            chunk = chunk.lower().strip()
            if len(chunk.split()) > 1 and len(chunk) > 3:
                topics.add(chunk)
        
        return list(topics)
    
    def _extract_keywords(self, tokens: List[tuple], entities: List[str], noun_chunks: List[str]) -> List[str]:
        """Extract relevant keywords from the text."""
        keywords = set()
        
        # Add entities as keywords
        keywords.update(entities)
        
        # Add noun chunks as potential keywords
        keywords.update(noun_chunks)
        
        # Add tokens that are likely to be important (nouns, proper nouns, adjectives)
        for text, pos, lemma in tokens:
            if pos in ["NOUN", "PROPN", "ADJ"] and len(lemma) > 2:
                # Skip common words and short words
                if lemma.lower() not in ["i", "me", "my", "we", "our", "you", "your", "it", "its"]:
                    keywords.add(lemma.lower())
        
        # Filter out any keywords that are too short
        keywords = {k for k in keywords if len(k) > 2}
        
        # Limit the number of keywords to avoid overwhelming the system
        return list(keywords)[:10]
    
    def _determine_skill_level(self, text: str) -> str:
        """Determine the skill level from the text."""
        text_lower = text.lower()
        
        # Check for skill level indicators
        if any(word in text_lower for word in ["beginner", "basic", "introduction", "getting started"]):
            return "beginner"
        elif any(word in text_lower for word in ["intermediate", "advanced", "expert", "master"]):
            return "advanced"
        
        # Default to beginner if we can't determine the level
        return "beginner"
    
    async def generate_response(self, intent: Dict[str, Any], recommendations: List[Dict[str, Any]]) -> str:
        """Generate a natural language response based on the intent and recommendations.
        
        Args:
            intent: The parsed user intent
            recommendations: List of recommended courses
            
        Returns:
            A natural language response
        """
        try:
            intent_type = intent.get("intent_type", "learn")
            topics = intent.get("topics", [])
            level = intent.get("level", "beginner")
            
            if not recommendations:
                return "I couldn't find any courses matching your query. Could you try different keywords or be more specific?"
            
            # Get the top recommendation
            top_rec = recommendations[0]
            
            # Generate a response based on intent type
            if intent_type == IntentType.LEARN.value:
                return (
                    f"I found a great course for you to learn {', '.join(topics[:2]) if topics else 'this topic'}. "
                    f"I recommend '{top_rec.get('title', 'this course')}' which is perfect for {level} learners. "
                    f"It covers {top_rec.get('description', 'relevant topics')}."
                )
            elif intent_type == IntentType.BUILD.value:
                return (
                    f"To help you build something with {', '.join(topics[:2]) if topics else 'these technologies'}, "
                    f"check out '{top_rec.get('title', 'this course')}'. "
                    f"It's designed for {level} level and will guide you through the process step by step."
                )
            elif intent_type == IntentType.COMPARE.value:
                if len(recommendations) > 1:
                    return (
                        f"Here's a comparison of {topics[0] if topics else 'these topics'}: "
                        f"1. {recommendations[0].get('title', 'First option')} - {recommendations[0].get('description', '')[:100]}... "
                        f"2. {recommendations[1].get('title', 'Second option')} - {recommendations[1].get('description', '')[:100]}..."
                    )
                else:
                    return f"I found a course about {topics[0] if topics else 'this topic'}: {top_rec.get('title', 'this course')}"
            else:
                return (
                    f"I found a course that might interest you: '{top_rec.get('title', 'this course')}'. "
                    f"It's suitable for {level} learners and covers {top_rec.get('description', 'relevant topics')}."
                )
                
        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return "I found some courses that might interest you. Please check the recommendations below."

# Singleton instance
model_service = ModelService()
