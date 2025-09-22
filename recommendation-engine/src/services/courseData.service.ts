import { Course } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';

export class CourseDataService {
  private static instance: CourseDataService;
  private courses: Course[] = [];
  private isLoaded = false;

  private constructor() {}

  static getInstance(): CourseDataService {
    if (!CourseDataService.instance) {
      CourseDataService.instance = new CourseDataService();
    }
    return CourseDataService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      // Try to load from JSON file first
      const catalogPath = path.join(process.cwd(), 'data', 'course-catalog.json');
      
      try {
        const catalogData = await fs.readFile(catalogPath, 'utf-8');
        this.courses = JSON.parse(catalogData);
        console.log(`📚 Loaded ${this.courses.length} courses from catalog`);
      } catch (error) {
        console.log('📋 Course catalog not found, using default data');
        this.courses = this.getDefaultCourses();
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('❌ Failed to initialize course data:', error);
      this.courses = this.getDefaultCourses();
      this.isLoaded = true;
    }
  }

  private getDefaultCourses(): Course[] {
    return [
      {
        id: 'python-beginner-1299',
        title: 'Python Beginner',
        level: 'beginner',
        price: 1299,
        currency: 'INR',
        features: [
          '30% refund via scholarship test',
          '20 tokens (missed class buyback)',
          '2 bootcamps (30% OFF)',
          'Certificate of completion'
        ],
        refund_policy: '30% refund via scholarship test',
        tokens: 20,
        bootcamps: '2 bootcamps (30% OFF)',
        certificate: true,
        description: 'Perfect for beginners starting their Python journey. Comprehensive coverage of Python fundamentals with hands-on projects.'
      },
      {
        id: 'python-bounder-1899',
        title: 'Python Bounder (Beginner → Intermediate)',
        level: 'intermediate',
        price: 1899,
        currency: 'INR',
        features: [
          '50% refund option',
          'Beginner to Intermediate progression',
          'Advanced Python concepts',
          'Real-world projects',
          'Certificate of completion'
        ],
        refund_policy: '50% refund option',
        certificate: true,
        description: 'Take your Python skills to the next level. This course bridges the gap between beginner and intermediate Python programming.'
      }
    ];
  }

  async getAllCourses(): Promise<Course[]> {
    if (!this.isLoaded) {
      await this.initialize();
    }
    return [...this.courses];
  }

  async getCourseById(id: string): Promise<Course | null> {
    if (!this.isLoaded) {
      await this.initialize();
    }
    return this.courses.find(course => course.id === id) || null;
  }

  async searchCourses(
    query: string,
    filters?: {
      level?: string;
      maxPrice?: number;
      features?: string[];
    }
  ): Promise<Course[]> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    const lowerQuery = query.toLowerCase();
    
    return this.courses.filter(course => {
      // Text search
      const matchesQuery = 
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description?.toLowerCase().includes(lowerQuery) ||
        course.features.some(feature => feature.toLowerCase().includes(lowerQuery));
      
      if (!matchesQuery) return false;
      
      // Apply filters
      if (filters?.level && !course.level.toLowerCase().includes(filters.level.toLowerCase())) {
        return false;
      }
      
      if (filters?.maxPrice && course.price > filters.maxPrice) {
        return false;
      }
      
      if (filters?.features) {
        const hasRequiredFeatures = filters.features.every(requiredFeature =>
          course.features.some(feature => 
            feature.toLowerCase().includes(requiredFeature.toLowerCase())
          ) || (requiredFeature === 'certificate' && course.certificate)
        );
        if (!hasRequiredFeatures) return false;
      }
      
      return true;
    });
  }

  getCourseCount(): number {
    return this.courses.length;
  }

  isReady(): boolean {
    return this.isLoaded;
  }
}