import asyncio
import logging
import os
from app.services.data_ingestion import data_ingestion_service
from app.services.vector_store import vector_store

logger = logging.getLogger(__name__)

async def initialize_data():
    """Initialize the recommendation system with course data."""
    try:
        logger.info("Starting data initialization...")
        
        # Check if we already have data in ChromaDB
        if vector_store.is_initialized:
            count = vector_store.collection.count()
            if count > 0:
                logger.info(f"ChromaDB already has {count} documents. Skipping initialization.")
                return
        
        # Path to the course catalog PDF
        pdf_path = os.path.join(os.path.dirname(__file__), '../data/course-catalog.pdf')
        
        if os.path.exists(pdf_path):
            logger.info(f"Processing course catalog: {pdf_path}")
            
            # Process the PDF and generate embeddings
            courses = await data_ingestion_service.process_catalog(pdf_path)
            
            if courses:
                # Add courses to vector store
                success = await vector_store.add_courses(courses)
                
                if success:
                    logger.info(f"Successfully initialized {len(courses)} courses in vector store")
                else:
                    logger.error("Failed to add courses to vector store")
            else:
                logger.warning("No courses extracted from PDF, using sample data")
        else:
            logger.warning(f"Course catalog PDF not found at {pdf_path}, using sample data")
        
    except Exception as e:
        logger.error(f"Failed to initialize data: {e}")
        logger.info("Falling back to sample data initialization")

if __name__ == "__main__":
    # Run the initialization
    asyncio.run(initialize_data())