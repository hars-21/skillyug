#!/bin/bash

# Build and test the recommendation system
echo "🚀 Building and Testing Skillyug Recommendation System"
echo "=================================================="

# Function to check if a service is ready
check_service_health() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - waiting for $service_name..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Build and start services
echo "🔨 Building services..."
make clean
make dev

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check ChromaDB
if ! check_service_health "http://localhost:8000/api/v1/heartbeat" "ChromaDB"; then
    echo "❌ ChromaDB is not running"
    exit 1
fi

# Check Backend
if ! check_service_health "http://localhost:5000/api/test" "Backend API"; then
    echo "❌ Backend API is not running"
    exit 1
fi

# Check Recommendation Engine
if ! check_service_health "http://localhost:8003/health" "Recommendation Engine"; then
    echo "❌ Recommendation Engine is not running"
    exit 1
fi

# Check Frontend
if ! check_service_health "http://localhost:3000" "Frontend"; then
    echo "❌ Frontend is not running"
    exit 1
fi

echo ""
echo "🎉 All services are running!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend:              http://localhost:3000"
echo "   Backend API:           http://localhost:5000"
echo "   Recommendation Engine: http://localhost:8003"
echo "   ChromaDB:              http://localhost:8000"
echo ""

# Test recommendation system
echo "🧪 Running recommendation engine tests..."
echo ""

cd recommendation-engine-fastapi

# Install test dependencies if needed
if ! python -c "import httpx" 2>/dev/null; then
    echo "Installing test dependencies..."
    pip install httpx
fi

# Run tests
python test_recommendation_system.py

echo ""
echo "✅ Testing completed! Check test_results.json for detailed results."
echo ""
echo "🔍 You can also test manually:"
echo "   curl -X POST http://localhost:8003/api/recommendations \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"user_query\": \"I want to learn backend development with Node.js\", \"ui_chips\": [\"backend\", \"nodejs\"]}'"
echo ""
echo "🌐 Access the system:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Docs: http://localhost:8003/docs"
echo "   - ChromaDB Admin: http://localhost:8000"