#!/bin/bash
set -e

echo "� Starting Skillyug Recommendation Engine..."

# Set default values
export PORT=${PORT:-8003}
export CHROMA_HOST=${CHROMA_HOST:-chromadb}
export CHROMA_PORT=${CHROMA_PORT:-8000}
export ENVIRONMENT=${ENVIRONMENT:-production}

echo "� Environment: $ENVIRONMENT"
echo "🌐 Port: $PORT"
echo "🗄️  ChromaDB: $CHROMA_HOST:$CHROMA_PORT"

# Pre-warm services by actually importing and initializing them
echo "🔥 Pre-warming services..."

python -c "
import sys
import os
sys.path.insert(0, '/app')

print('🤖 Initializing model service...')
from app.services.model_service import ModelService
model_service = ModelService()
print('✅ Model service ready')

print('🗃️  Initializing vector store...')
from app.services.vector_store import VectorStore
vector_store = VectorStore()
count = vector_store.get_document_count()
print(f'✅ Vector store ready - {count} documents')

print('📥 Initializing data ingestion service...')
from app.services.data_ingestion import DataIngestionService
data_service = DataIngestionService()
print('✅ Data ingestion service ready')

print('🎉 All services pre-warmed successfully!')
"

if [ $? -eq 0 ]; then
    echo "✅ Pre-warming completed successfully!"
else
    echo "❌ Pre-warming failed"
    exit 1
fi

# Start the appropriate server
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🔧 Starting development server..."
    exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
else
    # Use uvicorn for production (simpler and avoids worker timeout issues)
    echo "� Starting production server with uvicorn..."
    exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info
fi