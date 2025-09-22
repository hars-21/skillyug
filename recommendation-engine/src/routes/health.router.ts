import { Router, Request, Response } from 'express';
import { HealthStatus, ApiResponse } from '../types/index.js';
import { ModelManager } from '../services/model.service.js';
import { VectorStoreService } from '../services/vectorStore.service.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const modelManager = ModelManager.getInstance();
    const vectorStore = VectorStoreService.getInstance();
    
    const status: HealthStatus = {
      status: 'healthy',
      services: {
        models: modelManager.isReady() ? 'ready' : 'loading',
        vector_store: vectorStore.isReady() ? 'ready' : 'loading',
      },
      uptime: process.uptime(),
      version: '1.0.0',
    };

    // Check if all services are ready
    const allReady = Object.values(status.services).every(s => s === 'ready');
    if (!allReady) {
      status.status = 'unhealthy';
    }

    const response: ApiResponse<HealthStatus> = {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    };

    const httpStatus = status.status === 'healthy' ? 200 : 503;
    res.status(httpStatus).json(response);
    
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    };
    
    res.status(500).json(response);
  }
});

export { router as healthRouter };