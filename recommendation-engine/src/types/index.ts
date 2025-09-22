// Course types
export interface Course {
  id: string;
  title: string;
  level: string;
  price: number;
  currency: string;
  features: string[];
  refund_policy?: string;
  tokens?: number;
  bootcamps?: string;
  discount?: string;
  certificate?: boolean;
  description?: string;
}

// User Intent types
export interface UserIntent {
  intent: string;
  keywords: string[];
  level?: string;
  price_range?: {
    min?: number;
    max?: number;
  };
  features?: string[];
}

// Recommendation types
export interface Recommendation {
  course: Course;
  confidence_score: number;
  reasoning: string;
  match_type: 'exact' | 'similar' | 'fallback';
}

export interface RecommendationRequest {
  user_query: string;
  ui_chips?: string[];
  max_results?: number;
}

export interface RecommendationResponse {
  query: string;
  intent: UserIntent;
  recommendations: Recommendation[];
  message: string;
  total_results: number;
}

// Vector store types
export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    course_id: string;
    course_title: string;
    level: string;
    price: number;
    features: string[];
  };
  embedding?: number[];
}

// Model types
export interface ModelConfig {
  name: string;
  path: string;
  type: 'embedding' | 'generation';
  device: 'cpu' | 'gpu';
  max_length?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Health check types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  services: {
    models: 'ready' | 'loading' | 'error';
    vector_store: 'ready' | 'loading' | 'error';
  };
  uptime: number;
  version: string;
}