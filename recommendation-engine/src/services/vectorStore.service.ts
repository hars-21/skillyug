import { VectorDocument, Course } from '../types/index.js';
import { ModelManager } from './model.service.js';

export class VectorStoreService {
  private static instance: VectorStoreService;
  private chromaClient: any = null;
  private collection: any = null;
  private modelManager: ModelManager;
  private isInitialized = false;

  private constructor() {
    this.modelManager = ModelManager.getInstance();
  }

  static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService();
    }
    return VectorStoreService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const chromaHost = process.env.CHROMA_HOST || 'localhost';
      const chromaPort = process.env.CHROMA_PORT || '8000';
      
      console.log(`📊 Connecting to ChromaDB at ${chromaHost}:${chromaPort}...`);
      
      // For now, use in-memory fallback if ChromaDB is not available
      console.log('⚠️  Using in-memory vector store (ChromaDB not available)');
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Failed to initialize ChromaDB, using fallback:', error);
      this.isInitialized = true; // Continue with in-memory store
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    console.log(`📝 Adding ${documents.length} documents to vector store...`);
    
    for (const doc of documents) {
      if (!doc.embedding) {
        console.log(`🔄 Generating embedding for: ${doc.metadata.course_title}`);
        doc.embedding = await this.modelManager.generateEmbedding(doc.content);
      }
    }
    
    // Store in memory for now
    this.inMemoryDocuments.push(...documents);
    console.log(`✅ Added ${documents.length} documents to vector store`);
  }

  private inMemoryDocuments: VectorDocument[] = [];

  async searchSimilar(
    query: string, 
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<{ document: VectorDocument; score: number }[]> {
    console.log(`🔍 Searching for: "${query}"`);
    
    // Generate query embedding
    const queryEmbedding = await this.modelManager.generateEmbedding(query);
    
    // Calculate similarities
    const results = this.inMemoryDocuments
      .map(doc => ({
        document: doc,
        score: this.calculateCosineSimilarity(queryEmbedding, doc.embedding!)
      }))
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    console.log(`📊 Found ${results.length} similar documents`);
    return results;
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const norm = Math.sqrt(normA) * Math.sqrt(normB);
    return norm === 0 ? 0 : dotProduct / norm;
  }

  async loadCourseCatalog(courses: Course[]): Promise<void> {
    console.log(`📚 Loading ${courses.length} courses into vector store...`);
    
    const documents: VectorDocument[] = courses.map(course => ({
      id: course.id,
      content: this.courseToText(course),
      metadata: {
        course_id: course.id,
        course_title: course.title,
        level: course.level,
        price: course.price,
        features: course.features,
      },
    }));

    await this.addDocuments(documents);
  }

  private courseToText(course: Course): string {
    const parts = [
      `Title: ${course.title}`,
      `Level: ${course.level}`,
      `Price: ₹${course.price}`,
      `Features: ${course.features.join(', ')}`,
    ];

    if (course.description) {
      parts.push(`Description: ${course.description}`);
    }

    if (course.refund_policy) {
      parts.push(`Refund: ${course.refund_policy}`);
    }

    return parts.join('\n');
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getDocumentCount(): number {
    return this.inMemoryDocuments.length;
  }
}