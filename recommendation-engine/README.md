# Course Recommendation Engine

A sophisticated AI-powered microservice that provides intelligent course recommendations using Retrieval-Augmented Generation (RAG) pipeline with local language models.

## 🎯 Features

- **Natural Language Understanding**: Parses user intents from natural language queries
- **Local AI Models**: Uses lightweight models (DistilGPT2 + all-MiniLM-L6-v2) that run locally
- **RAG Pipeline**: Combines vector similarity search with LLM generation
- **Smart Fallback**: Exact match → Similar match → Persuasive fallback recommendations
- **Business Logic**: Optimized for course sales conversion
- **Docker Ready**: Fully containerized with ChromaDB integration

## 🏗️ Architecture

```
User Query → Intent Parser → Vector Search → LLM Generation → Business Rules → Recommendation
```

### Components

1. **Model Service**: Manages embedding and generation models
2. **Vector Store**: ChromaDB for course embeddings and similarity search
3. **Course Data**: Course catalog management and filtering
4. **Recommendation Service**: Core business logic and recommendation orchestration
5. **API Layer**: RESTful endpoints with comprehensive error handling

## 📦 Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Download and setup models (optional - they'll download on first use)
npm run setup
```

## 🚀 Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker
```bash
# Build and run the service with ChromaDB
docker-compose up --build

# Run in background
docker-compose up -d
```

### Testing
```bash
npm run test
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "models": "ready",
      "vector_store": "ready"
    },
    "uptime": 3600,
    "version": "1.0.0"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Recommendations
```
POST /api/recommendations
```

Request:
```json
{
  "user_query": "I want to learn Python for beginners",
  "ui_chips": ["certification", "affordable"],
  "max_results": 5
}
```

Response:
```json
{
  "success": true,
  "data": {
    "query": "I want to learn Python for beginners",
    "intent": {
      "intent": "Learn Python",
      "keywords": ["python"],
      "level": "beginner"
    },
    "recommendations": [
      {
        "course": {
          "id": "python-beginner-1299",
          "title": "Python Beginner",
          "level": "beginner",
          "price": 1299,
          "features": ["Certificate", "30% refund", "20 tokens"]
        },
        "confidence_score": 0.95,
        "reasoning": "Perfect match: covers python, matches your beginner level",
        "match_type": "exact"
      }
    ],
    "message": "Found perfect matches for your query!",
    "total_results": 1
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test Endpoint
```
GET /api/recommendations/test
```

## 🤖 Models

The service uses lightweight models that can run on CPU:

- **Embedding**: `Xenova/all-MiniLM-L6-v2` (22MB)
  - Generates 384-dimensional embeddings
  - Fast inference on CPU
  
- **Generation**: `Xenova/distilgpt2` (82MB)
  - Lightweight text generation
  - Good for intent parsing and reasoning

## 📊 Business Logic

### Matching Strategy

1. **Exact Match** (Score ≥ 0.4):
   - Level matching (0.4 points)
   - Keyword matching (0.3 points)
   - Price range (0.2 points)
   - Feature matching (0.1 points each)

2. **Similar Match** (Similarity ≥ 0.6):
   - Vector similarity search
   - Content-based matching

3. **Fallback Recommendations**:
   - Most affordable courses
   - Persuasive messaging for conversion

### Persuasive Messaging

For fallback recommendations, the system generates business-focused messages:
- Emphasizes value proposition
- Highlights course benefits
- Uses social proof techniques
- Focuses on accessibility and starter benefits

## 🔧 Configuration

Environment variables (`.env`):

```bash
# Service
PORT=8003
NODE_ENV=development

# Models
MODEL_CACHE_DIR=./models/cache
DEVICE=cpu
MAX_SEQUENCE_LENGTH=512

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION_NAME=course_embeddings

# Business Rules
MAX_RECOMMENDATIONS=5
MIN_SIMILARITY_THRESHOLD=0.7

# Logging
LOG_LEVEL=info
```

## 📁 Project Structure

```
recommendation-engine/
├── src/
│   ├── services/           # Core business logic
│   │   ├── model.service.ts
│   │   ├── vectorStore.service.ts
│   │   ├── courseData.service.ts
│   │   └── recommendation.service.ts
│   ├── routes/             # API endpoints
│   │   ├── health.router.ts
│   │   └── recommendation.router.ts
│   ├── middleware/         # Express middleware
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── scripts/            # Utility scripts
│   ├── test.ts             # Test runner
│   └── index.ts            # Main entry point
├── data/                   # Course catalog data
├── models/                 # Model cache directory
├── docker-compose.yml      # Multi-service setup
├── Dockerfile              # Container definition
└── package.json            # Dependencies
```

## 🧪 Testing

The service includes comprehensive testing:

```bash
# Run integration tests
npm run test

# Test specific queries
curl -X POST http://localhost:8003/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"user_query": "Python course for beginners under 1500"}'

# Health check
curl http://localhost:8003/health
```

## 🔄 Integration with Main App

To integrate with the main Skillyug application:

1. **Update main docker-compose.dev.yml**:
```yaml
services:
  recommendation-engine:
    build:
      context: ./recommendation-engine
    ports:
      - "8003:8003"
    networks:
      - skillyug-network
```

2. **Backend Integration**:
```typescript
// In Backend/src/services/
class RecommendationClient {
  async getRecommendations(query: string) {
    const response = await fetch('http://recommendation-engine:8003/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_query: query })
    });
    return response.json();
  }
}
```

3. **Frontend Integration**:
```typescript
// In frontend-nextjs/src/hooks/
export const useRecommendations = () => {
  const getRecommendations = async (query: string) => {
    const response = await fetch('/api/recommendations/proxy', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
    return response.json();
  };
  
  return { getRecommendations };
};
```

## 🚀 Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recommendation-engine
spec:
  replicas: 2
  selector:
    matchLabels:
      app: recommendation-engine
  template:
    spec:
      containers:
      - name: recommendation-engine
        image: skillyug/recommendation-engine:latest
        ports:
        - containerPort: 8003
        env:
        - name: NODE_ENV
          value: "production"
```

## 🔍 Monitoring

The service provides health checks and logging:

- Health endpoint: `/health`
- Structured logging with timestamps
- Model loading status tracking
- Vector store readiness monitoring
- Performance metrics (response times, success rates)

## 🛠️ Troubleshooting

### Common Issues

1. **Models not loading**:
   - Check internet connection for first-time download
   - Verify MODEL_CACHE_DIR permissions
   - Increase memory allocation

2. **ChromaDB connection failed**:
   - Service falls back to in-memory storage
   - Check docker-compose network setup
   - Verify ChromaDB container is running

3. **Low recommendation quality**:
   - Update course catalog data
   - Adjust similarity thresholds
   - Fine-tune business logic weights

### Logs
```bash
# View real-time logs
docker-compose logs -f recommendation-engine

# Check model initialization
grep "Model" logs/app.log

# Monitor recommendations
grep "🎯" logs/app.log
```

## 📈 Performance

- **Model Loading**: ~5-10 seconds on first startup
- **Embedding Generation**: ~50ms per query
- **Vector Search**: ~10ms for 100 documents  
- **End-to-end Latency**: ~200-500ms per recommendation
- **Memory Usage**: ~500MB (models + runtime)
- **CPU Usage**: 1-2 cores during inference

## 🔮 Future Enhancements

- [ ] Model fine-tuning on course data
- [ ] A/B testing framework for recommendation strategies
- [ ] Real-time user feedback integration
- [ ] Multi-language support
- [ ] Caching layer for popular queries
- [ ] Advanced analytics and metrics
- [ ] Integration with user behavior tracking
- [ ] Personalized recommendations based on user history