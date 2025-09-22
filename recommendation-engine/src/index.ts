import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { recommendationRouter } from './routes/recommendation.router.js';
import { healthRouter } from './routes/health.router.js';
import { ModelManager } from './services/model.service.js';
import { VectorStoreService } from './services/vectorStore.service.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/recommendations', recommendationRouter);

// Error handling
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initializing Recommendation Engine...');
    
    // Initialize model manager
    const modelManager = ModelManager.getInstance();
    await modelManager.initialize();
    console.log('✅ Model Manager initialized');
    
    // Initialize vector store
    const vectorStore = VectorStoreService.getInstance();
    await vectorStore.initialize();
    console.log('✅ Vector Store initialized');
    
    console.log('🎯 Recommendation Engine ready!');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`🌟 Recommendation Engine running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 API endpoint: http://localhost:${PORT}/api/recommendations`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  process.exit(0);
});

startServer();