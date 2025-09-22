import { 
  Course, 
  UserIntent, 
  Recommendation, 
  RecommendationRequest, 
  RecommendationResponse 
} from '../types/index.js';
import { ModelManager } from './model.service.js';
import { VectorStoreService } from './vectorStore.service.js';
import { CourseDataService } from './courseData.service.js';

export class RecommendationService {
  private static instance: RecommendationService;
  private modelManager: ModelManager;
  private vectorStore: VectorStoreService;
  private courseData: CourseDataService;

  private constructor() {
    this.modelManager = ModelManager.getInstance();
    this.vectorStore = VectorStoreService.getInstance();
    this.courseData = CourseDataService.getInstance();
  }

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const { user_query, ui_chips = [], max_results = 5 } = request;
    
    console.log(`🎯 Processing recommendation request: "${user_query}"`);
    
    // Combine query with UI chips
    const enhancedQuery = [user_query, ...ui_chips].join(' ');
    
    // Parse user intent
    const intent = await this.modelManager.parseIntent(enhancedQuery);
    console.log('🧠 Parsed intent:', intent);
    
    // Get available courses
    const allCourses = await this.courseData.getAllCourses();
    
    // Try exact matching first
    const exactMatches = this.findExactMatches(allCourses, intent);
    
    if (exactMatches.length > 0) {
      console.log(`✅ Found ${exactMatches.length} exact matches`);
      return this.formatResponse(user_query, intent, exactMatches, 'exact');
    }
    
    // Fall back to vector similarity search
    const similarResults = await this.vectorStore.searchSimilar(
      enhancedQuery, 
      max_results,
      0.6 // Lower threshold for broader results
    );
    
    if (similarResults.length > 0) {
      console.log(`📊 Found ${similarResults.length} similar matches`);
      const recommendations = similarResults.map(result => ({
        course: allCourses.find(c => c.id === result.document.metadata.course_id)!,
        confidence_score: result.score,
        reasoning: `Similar to your query based on course content (${(result.score * 100).toFixed(1)}% match)`,
        match_type: 'similar' as const,
      }));
      
      return this.formatResponse(user_query, intent, recommendations, 'similar');
    }
    
    // Final fallback - recommend most popular/affordable courses
    console.log('💡 Using fallback recommendations');
    const fallbackRecommendations = this.generateFallbackRecommendations(allCourses, intent);
    
    return this.formatResponse(user_query, intent, fallbackRecommendations, 'fallback');
  }

  private findExactMatches(courses: Course[], intent: UserIntent): Recommendation[] {
    const matches: Recommendation[] = [];
    
    for (const course of courses) {
      let score = 0;
      const reasons: string[] = [];
      
      // Check level match
      if (intent.level && course.level.toLowerCase().includes(intent.level.toLowerCase())) {
        score += 0.4;
        reasons.push(`matches your ${intent.level} level`);
      }
      
      // Check keyword matches in title
      for (const keyword of intent.keywords) {
        if (course.title.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.3;
          reasons.push(`covers ${keyword}`);
        }
      }
      
      // Check price range
      if (intent.price_range?.max && course.price <= intent.price_range.max) {
        score += 0.2;
        reasons.push(`within your budget of ₹${intent.price_range.max}`);
      }
      
      // Check feature matches
      if (intent.features) {
        for (const feature of intent.features) {
          const hasFeature = course.features.some(f => 
            f.toLowerCase().includes(feature.toLowerCase())
          ) || (feature === 'certificate' && course.certificate);
          
          if (hasFeature) {
            score += 0.1;
            reasons.push(`includes ${feature}`);
          }
        }
      }
      
      if (score >= 0.4) { // Minimum threshold for exact match
        matches.push({
          course,
          confidence_score: Math.min(score, 1.0),
          reasoning: `Perfect match: ${reasons.join(', ')}`,
          match_type: 'exact',
        });
      }
    }
    
    return matches.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  private generateFallbackRecommendations(courses: Course[], intent: UserIntent): Recommendation[] {
    // Sort by popularity (lower price usually means more accessible)
    const sortedCourses = [...courses].sort((a, b) => a.price - b.price);
    
    return sortedCourses.slice(0, 2).map(course => ({
      course,
      confidence_score: 0.5,
      reasoning: this.generatePersuasiveMessage(course, intent),
      match_type: 'fallback' as const,
    }));
  }

  private generatePersuasiveMessage(course: Course, intent: UserIntent): string {
    const messages = [
      `While this ${course.level} ${course.title} might not be exactly what you searched for, it's a great starting point`,
      `This course offers excellent value at ₹${course.price} and includes ${course.features.length} key features`,
      `Many students start with our ${course.level} courses and love the comprehensive approach`,
      `At just ₹${course.price}, this gives you ${course.features.join(', ')} - perfect for building foundation skills`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private formatResponse(
    query: string, 
    intent: UserIntent, 
    recommendations: Recommendation[],
    primaryType: string
  ): RecommendationResponse {
    let message = '';
    
    switch (primaryType) {
      case 'exact':
        message = `Found perfect matches for your "${intent.intent}" query!`;
        break;
      case 'similar':
        message = `Here are some courses similar to what you're looking for:`;
        break;
      case 'fallback':
        message = `While we couldn't find exact matches, here are some great courses to consider:`;
        break;
    }
    
    return {
      query,
      intent,
      recommendations,
      message,
      total_results: recommendations.length,
    };
  }
}