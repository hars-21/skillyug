import { ModelManager } from './services/model.service.js';
import { VectorStoreService } from './services/vectorStore.service.js';
import { CourseDataService } from './services/courseData.service.js';
import { RecommendationService } from './services/recommendation.service.js';

async function runTest() {
  console.log('🧪 Starting Recommendation Engine Test...\n');
  
  try {
    // Initialize services
    console.log('1. Initializing services...');
    const modelManager = ModelManager.getInstance();
    await modelManager.initialize();
    console.log('   ✅ Model Manager ready');
    
    const courseData = CourseDataService.getInstance();
    await courseData.initialize();
    console.log('   ✅ Course Data ready');
    
    const vectorStore = VectorStoreService.getInstance();
    await vectorStore.initialize();
    console.log('   ✅ Vector Store ready');
    
    // Load courses into vector store
    console.log('\n2. Loading courses...');
    const courses = await courseData.getAllCourses();
    await vectorStore.loadCourseCatalog(courses);
    console.log(`   ✅ Loaded ${courses.length} courses`);
    
    // Test recommendations
    console.log('\n3. Testing recommendations...');
    const recommendationService = RecommendationService.getInstance();
    
    const testQueries = [
      'I want to learn Python for beginners',
      'Python course under 1500 rupees',
      'Intermediate Python with certificate',
      'Machine learning course',  // Should trigger fallback
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎯 Testing: "${query}"`);
      const result = await recommendationService.getRecommendations({
        user_query: query,
        max_results: 3,
      });
      
      console.log(`   Intent: ${result.intent.intent}`);
      console.log(`   Found: ${result.recommendations.length} recommendations`);
      
      result.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.course.title} (${rec.match_type}, ${(rec.confidence_score * 100).toFixed(1)}%)`);
        console.log(`      Price: ₹${rec.course.price} | Level: ${rec.course.level}`);
      });
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();