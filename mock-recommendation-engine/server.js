import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8003; // Using the same port as the real recommendation engine

// Middleware
app.use(cors());
app.use(express.json());

// Mock recommendations data
const mockRecommendations = [
  {
    id: 1,
    title: "Python for Beginners",
    description: "Learn Python programming from scratch",
    price: 1299,
    level: "beginner",
    features: ["certificate", "lifetime access", "projects"],
    popularity: 0.95,
  },
  {
    id: 2,
    title: "Intermediate Python Programming",
    description: "Take your Python skills to the next level",
    price: 1899,
    level: "intermediate", 
    features: ["certificate", "lifetime access", "advanced projects"],
    popularity: 0.85,
  },
  {
    id: 3,
    title: "Python for Data Science",
    description: "Learn Python for data analysis and visualization",
    price: 2499,
    level: "intermediate",
    features: ["certificate", "lifetime access", "real-world datasets"],
    popularity: 0.9,
  },
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Recommendation endpoint
app.post('/api/recommendations', (req, res) => {
  const { user_query } = req.body;
  
  console.log(`Received recommendation request: "${user_query}"`);
  
  // Return mock recommendations
  res.json({
    success: true,
    data: {
      recommendations: mockRecommendations,
      intent: {
        intent: "learn_python",
        confidence: 0.95,
        extracted_keywords: ["python", "beginner"]
      },
      reasoning: `Based on your query "${user_query}", I recommend Python courses for beginners.`
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock recommendation engine running on http://localhost:${PORT}`);
});