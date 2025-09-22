#!/usr/bin/env node

// Simple test script that doesn't require compilation
const { spawn } = require('child_process');
const fs = require('fs');

async function testRecommendationEngine() {
  console.log('🧪 Testing Recommendation Engine...');
  
  // Check if the service is built
  if (!fs.existsSync('./dist/index.js')) {
    console.log('❌ Service not built. Run: npm run build');
    process.exit(1);
  }
  
  console.log('✅ Service built successfully');
  
  // Start the service in background
  console.log('🚀 Starting service...');
  const service = spawn('node', ['dist/index.js'], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  service.stdout.on('data', (data) => {
    console.log(`Service: ${data.toString().trim()}`);
  });
  
  service.stderr.on('data', (data) => {
    console.log(`Service Error: ${data.toString().trim()}`);
  });
  
  // Wait for service to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test health endpoint
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await fetch('http://localhost:8003/health');
    const data = await response.json();
    console.log('Health check:', data.success ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test recommendation endpoint
  try {
    console.log('🎯 Testing recommendations...');
    const response = await fetch('http://localhost:8003/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_query: 'I want to learn Python for beginners',
        max_results: 3
      })
    });
    
    const data = await response.json();
    console.log('Recommendations:', data.success ? '✅ PASS' : '❌ FAIL');
    
    if (data.success && data.data.recommendations) {
      console.log(`Found ${data.data.recommendations.length} recommendations`);
    }
    
  } catch (error) {
    console.log('❌ Recommendations test failed:', error.message);
  }
  
  // Cleanup
  service.kill();
  process.exit(0);
}

testRecommendationEngine().catch(console.error);