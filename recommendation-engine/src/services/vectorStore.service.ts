import { VectorDocument, Course } from '../types/index.js';
import { ModelManager } from './model.service.js';
import { QdrantClient } from '@qdrant/js-client-rest';

export class VectorStoreService {
  private static instance: VectorStoreService;
  private qdrantClient: QdrantClient | null = null;
  private collectionName: string;
  private modelManager: ModelManager;
  private isInitialized = false;

  private constructor() {
    this.modelManager = ModelManager.getInstance();
    this.collectionName = process.env.QDRANT_COLLECTION_NAME || 'course_embeddings';
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
      const qdrantHost = process.env.QDRANT_HOST || 'localhost';
      const qdrantPort = process.env.QDRANT_PORT || '6333';
      
      console.log(`📊 Connecting to Qdrant at ${qdrantHost}:${qdrantPort}...`);
      
      this.qdrantClient = new QdrantClient({
        host: qdrantHost,
        port: Number(qdrantPort),
      });
      
      // Check connection
      try {
        await this.qdrantClient.getCollections();
        console.log('✅ Connected to Qdrant successfully');
        
        // Create collection if it doesn't exist
        try {
          await this.qdrantClient.getCollection(this.collectionName);
          console.log(`✅ Collection ${this.collectionName} exists`);
        } catch (error) {
          console.log(`⚠️ Collection ${this.collectionName} doesn't exist, creating it...`);
          await this.qdrantClient.createCollection(this.collectionName, {
            vectors: { 
              size: 384,  // Embedding dimension
              distance: 'Cosine'
            }
          });
          console.log(`✅ Collection ${this.collectionName} created`);
        }
        
        this.isInitialized = true;
      } catch (error) {
        throw new Error(`Failed to connect to Qdrant: ${error}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Qdrant, using fallback:', error);
      this.isInitialized = true; // Continue with in-memory store
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    console.log(`📝 Adding ${documents.length} documents to vector store...`);
    
    const points = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      if (!doc.embedding) {
        console.log(`🔄 Generating embedding for: ${doc.metadata.course_title}`);
        doc.embedding = await this.modelManager.generateEmbedding(doc.content);
      }
      
      points.push({
        id: doc.id || i.toString(),
        vector: doc.embedding,
        payload: {
          content: doc.content,
          ...doc.metadata
        }
      });
    }
    
    if (this.qdrantClient) {
      try {
        // Insert points into Qdrant
        await this.qdrantClient.upsert(this.collectionName, {
          points
        });
        console.log(`✅ Added ${documents.length} documents to Qdrant vector store`);
      } catch (error) {
        console.error('❌ Failed to add documents to Qdrant:', error);
        // Fallback to in-memory
        this.inMemoryDocuments.push(...documents);
        console.log(`⚠️ Used in-memory fallback for ${documents.length} documents`);
      }
    } else {
      // Fallback to in-memory
      this.inMemoryDocuments.push(...documents);
      console.log(`⚠️ Used in-memory fallback for ${documents.length} documents`);
    }
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
    
    if (this.qdrantClient) {
      try {
        // Search in Qdrant
        const searchResults = await this.qdrantClient.search(this.collectionName, {
          vector: queryEmbedding,
          limit: limit,
          score_threshold: threshold
        });
        
        // Convert Qdrant results to our format
        const results = searchResults.map(result => ({
          document: {
            id: result.id as string,
            content: result.payload.content as string,
            metadata: {
              course_id: result.payload.course_id as string,
              course_title: result.payload.course_title as string,
              level: result.payload.level as string,
              price: result.payload.price as number,
              features: result.payload.features as string[]
            },
            embedding: queryEmbedding // Not really used after search
          },
          score: result.score
        }));
        
        console.log(`📊 Found ${results.length} similar documents in Qdrant`);
        return results;
      } catch (error) {
        console.error('❌ Failed to search in Qdrant, falling back to in-memory:', error);
        // Fall back to in-memory search
      }
    }
    
    // Fallback: In-memory search
    const results = this.inMemoryDocuments
      .map(doc => ({
        document: doc,
        score: this.calculateCosineSimilarity(queryEmbedding, doc.embedding!)
      }))
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    console.log(`📊 Found ${results.length} similar documents in memory`);
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