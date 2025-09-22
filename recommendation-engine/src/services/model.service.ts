import { pipeline } from '@xenova/transformers';

export class ModelManager {
  private static instance: ModelManager;
  private embeddingModel: any = null;
  private generationModel: any = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('📥 Loading embedding model...');
      // Use lightweight sentence-transformers model for embeddings
      this.embeddingModel = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
      console.log('✅ Embedding model loaded');

      console.log('📥 Loading generation model...');
      // Use lightweight text generation model
      this.generationModel = await pipeline(
        'text-generation',
        'Xenova/distilgpt2'
      );
      console.log('✅ Generation model loaded');

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize models:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingModel) {
      throw new Error('Embedding model not initialized');
    }

    try {
      const result = await this.embeddingModel(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Extract the embedding array
      let embedding: number[];
      if (Array.isArray(result)) {
        embedding = result[0] as number[];
      } else if (result.data) {
        embedding = Array.from(result.data as Float32Array);
      } else {
        throw new Error('Unexpected embedding result format');
      }

      return embedding;
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  async generateText(
    prompt: string,
    maxLength: number = 150,
    temperature: number = 0.7
  ): Promise<string> {
    if (!this.generationModel) {
      throw new Error('Generation model not initialized');
    }

    try {
      const result = await this.generationModel(prompt, {
        max_new_tokens: maxLength,
        temperature,
        do_sample: true,
        return_full_text: false,
      });

      if (Array.isArray(result) && result.length > 0) {
        return result[0].generated_text.trim();
      }
      
      throw new Error('No text generated');
    } catch (error) {
      console.error('❌ Failed to generate text:', error);
      throw error;
    }
  }

  async parseIntent(userQuery: string): Promise<{
    intent: string;
    keywords: string[];
    level?: string;
    price_range?: { min?: number; max?: number };
    features?: string[];
  }> {
    const prompt = `Analyze this course query and extract structured information:
Query: "${userQuery}"

Extract:
- Intent (what they want to learn)
- Keywords (important terms)
- Level (beginner, intermediate, advanced)
- Price preferences
- Desired features

Format as JSON:`;

    try {
      const response = await this.generateText(prompt, 100);
      
      // Fallback to regex-based parsing if LLM fails
      return this.fallbackIntentParsing(userQuery);
    } catch (error) {
      console.warn('⚠️ LLM intent parsing failed, using fallback:', error);
      return this.fallbackIntentParsing(userQuery);
    }
  }

  private fallbackIntentParsing(query: string) {
    const lowerQuery = query.toLowerCase();
    
    // Extract level
    let level: string | undefined;
    if (lowerQuery.includes('beginner') || lowerQuery.includes('basic') || lowerQuery.includes('start')) {
      level = 'beginner';
    } else if (lowerQuery.includes('intermediate') || lowerQuery.includes('advance')) {
      level = 'intermediate';
    } else if (lowerQuery.includes('advanced') || lowerQuery.includes('expert')) {
      level = 'advanced';
    }

    // Extract programming language/technology
    const techKeywords = ['python', 'javascript', 'java', 'react', 'node', 'data science', 'machine learning'];
    const keywords = techKeywords.filter(tech => lowerQuery.includes(tech));

    // Extract price preferences
    let price_range: { min?: number; max?: number } | undefined;
    const priceMatch = query.match(/under|below|less than|up to\s*₹?(\d+)/i);
    if (priceMatch) {
      price_range = { max: parseInt(priceMatch[1]) };
    }

    // Extract features
    const features: string[] = [];
    if (lowerQuery.includes('certificate')) features.push('certificate');
    if (lowerQuery.includes('bootcamp')) features.push('bootcamp');
    if (lowerQuery.includes('refund')) features.push('refund');

    return {
      intent: keywords.length > 0 ? `Learn ${keywords.join(', ')}` : 'General programming course',
      keywords,
      level,
      price_range,
      features: features.length > 0 ? features : undefined,
    };
  }

  isReady(): boolean {
    return this.isInitialized && this.embeddingModel !== null && this.generationModel !== null;
  }
}