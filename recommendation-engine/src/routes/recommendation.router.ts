import { Router, Request, Response } from 'express';
import { RecommendationRequest, ApiResponse } from '../types/index.js';
import { RecommendationService } from '../services/recommendation.service.js';

const router = Router();
const recommendationService = RecommendationService.getInstance();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const request: RecommendationRequest = req.body;
    
    // Validate request
    if (!request.user_query || typeof request.user_query !== 'string') {
      const response: ApiResponse = {
        success: false,
        error: 'user_query is required and must be a string',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    console.log(`🎯 Recommendation request: "${request.user_query}"`);
    
    const recommendations = await recommendationService.getRecommendations(request);
    
    const response: ApiResponse = {
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Recommendation error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to get recommendations',
      timestamp: new Date().toISOString(),
    };
    
    res.status(500).json(response);
  }
});

// Test endpoint
router.get('/test', async (req: Request, res: Response) => {
  try {
    const testQuery = 'I want to learn Python for beginners';
    
    const recommendations = await recommendationService.getRecommendations({
      user_query: testQuery,
      max_results: 3,
    });
    
    const response: ApiResponse = {
      success: true,
      data: {
        test_query: testQuery,
        recommendations,
      },
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
    
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Test endpoint failed',
      timestamp: new Date().toISOString(),
    };
    
    res.status(500).json(response);
  }
});

export { router as recommendationRouter };