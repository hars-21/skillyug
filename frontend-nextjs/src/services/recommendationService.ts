export interface RecommendationResponse {
  query: string;
  intent: {
    intent: string;
    keywords: string[];
    level?: string;
    price_range?: { min?: number; max?: number };
    features?: string[];
  };
  recommendations: {
    course: {
      id: string;
      title: string;
      level: string;
      price: number;
      currency: string;
      features: string[];
      refund_policy?: string;
      tokens?: number;
      bootcamps?: string;
      certificate?: boolean;
      description?: string;
    };
    confidence_score: number;
    reasoning: string;
    match_type: 'exact' | 'similar' | 'fallback';
  }[];
  message: string;
  total_results: number;
}

export const getRecommendations = async (query: string, uiChips: string[] = []): Promise<RecommendationResponse> => {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_query: query,
        ui_chips: uiChips,
        max_results: 5
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch recommendations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};
