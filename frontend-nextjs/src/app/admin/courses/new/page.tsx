'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Plus,
  Trophy,
  Target,
  BookOpen,
  Minus
} from 'lucide-react';
import { useCreateCourse } from '@/hooks/useAdminApi';
import { CreateCourseInput } from '@/utils/apiAdmin';

interface FormErrors {
  [key: string]: string;
}

interface ExtendedCourseInput extends CreateCourseInput {
  benefits?: string[];
  learningOutcomes?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ExtendedCourseInput>({
    courseName: '',
    description: '',
    imageUrl: '',
    price: 0,
    token: 0,
    category: '',
    difficulty: 'BEGINNER',
    durationHours: 0,
    language: 'English',
    isActive: true,
    isFeatured: false,
    learningPathId: '',
    instructor: 'SkillyUG Team',
    benefits: [''],
    learningOutcomes: [''],
    videoUrl: '',
    thumbnailUrl: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createCourseMutation = useCreateCourse();

  const categories = [
    'PROGRAMMING',
    'WEB_DEVELOPMENT',
    'MOBILE_DEVELOPMENT',
    'DATA_SCIENCE',
    'ARTIFICIAL_INTELLIGENCE',
    'CLOUD_COMPUTING',
    'CYBERSECURITY',
    'DESIGN',
    'BUSINESS',
    'MARKETING',
    'OTHER'
  ];

  const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    } else if (formData.courseName.length < 5) {
      newErrors.courseName = 'Course name must be at least 5 characters';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Please select a difficulty level';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.token !== undefined && formData.token < 0) {
      newErrors.token = 'Token cannot be negative';
    }

    if (!formData.durationHours || formData.durationHours <= 0) {
      newErrors.durationHours = 'Course duration is required and must be greater than 0';
    }

    if (!formData.instructor?.trim()) {
      newErrors.instructor = 'Instructor name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitError(null);

    try {
      // Clean up the data to match API requirements
      const cleanedData: CreateCourseInput = {
        courseName: formData.courseName,
        description: formData.description,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/400x200',
        price: formData.price,
        token: formData.token,
        category: formData.category,
        difficulty: formData.difficulty,
        durationHours: formData.durationHours,
        language: formData.language || 'English',
        isActive: formData.isActive ?? true,
        isFeatured: formData.isFeatured ?? false,
        learningPathId: formData.learningPathId,
        instructor: formData.instructor || 'SkillyUG Team',
      };

      await createCourseMutation.mutateAsync(cleanedData);

      // Success - redirect to courses page
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: keyof ExtendedCourseInput, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addArrayItem = (field: 'benefits' | 'learningOutcomes') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field: 'benefits' | 'learningOutcomes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_: string, i: number) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'benefits' | 'learningOutcomes', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).map((item: string, i: number) => i === index ? value : item)
    }));
  };

  return (
    <div className="min-h-screen" style={{background: '#2741D6'}}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/courses')}
              className="p-2 text-white rounded-lg transition-colors hover:opacity-80 mr-4"
              style={{background: '#051C7F'}}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Course</h1>
              <p className="text-white/80 mt-1">Add a new course to your platform</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Submit Error */}
            {submitError && (
              <div className="rounded-lg p-4 border border-red-300 flex items-start" style={{background: '#FEF2F2'}}>
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error creating course</h3>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            )}

            {/* Mutation Error */}
            {createCourseMutation.error && (
              <div className="rounded-lg p-4 border border-red-300 flex items-start" style={{background: '#FEF2F2'}}>
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error creating course</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {createCourseMutation.error instanceof Error
                      ? createCourseMutation.error.message
                      : 'An unexpected error occurred. Please try again.'}
                  </p>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="rounded-lg shadow-sm border border-white/10 p-6" style={{background: '#051C7F'}}>
              <div className="flex items-center mb-6">
                <BookOpen className="w-5 h-5 text-white mr-3" />
                <h2 className="text-xl font-bold text-white">Basic Information</h2>
              </div>

              <div className="space-y-6">
                {/* Course courseName */}
                <div>
                  <label htmlFor="courseName" className="block text-sm font-medium text-white mb-2">
                    Course courseName *
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors ${
                      errors.courseName ? 'border-red-300' : 'border-white/20'
                    }`}
                    placeholder="e.g., Python Beginner Course"
                    disabled={createCourseMutation.isPending}
                  />
                  {errors.courseName && (
                    <p className="text-sm text-red-300 mt-1">{errors.courseName}</p>
                  )}
                </div>

                {/* Course Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                    Course Description *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors resize-none ${
                      errors.description ? 'border-red-300' : 'border-white/20'
                    }`}
                    placeholder="Describe what students will learn in this course"
                    disabled={createCourseMutation.isPending}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-300 mt-1">{errors.description}</p>
                  )}
                  <p className="text-sm text-white/60 mt-1">
                    {(formData.description || '').length}/500 characters
                  </p>
                </div>

                {/* Category, Difficulty, Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors ${
                        errors.category ? 'border-red-300' : 'border-white/20'
                      }`}
                      disabled={createCourseMutation.isPending}
                    >
                      <option value="" className="text-gray-900">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category} className="text-gray-900">
                          {category.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-300 mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-white mb-2">
                      Difficulty Level *
                    </label>
                    <select
                      id="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors ${
                        errors.difficulty ? 'border-red-300' : 'border-white/20'
                      }`}
                      disabled={createCourseMutation.isPending}
                    >
                      <option value="" className="text-gray-900">Select difficulty</option>
                      {difficulties.map((difficulty) => (
                        <option key={difficulty} value={difficulty} className="text-gray-900">
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.difficulty && (
                      <p className="text-sm text-red-300 mt-1">{errors.difficulty}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="durationHours" className="block text-sm font-medium text-white mb-2">
                      Duration (Hours) *
                    </label>
                    <input
                      type="number"
                      id="durationHours"
                      min="1"
                      value={formData.durationHours || ''}
                      onChange={(e) => handleInputChange('durationHours', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors ${
                        errors.durationHours ? 'border-red-300' : 'border-white/20'
                      }`}
                      placeholder="e.g., 22"
                      disabled={createCourseMutation.isPending}
                    />
                    {errors.durationHours && (
                      <p className="text-sm text-red-300 mt-1">{errors.durationHours}</p>
                    )}
                  </div>
                </div>

                {/* Price, Token Price, Language, Instructor */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
                      Course Price (₹) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors ${
                        errors.price ? 'border-red-300' : 'border-white/20'
                      }`}
                      placeholder="0"
                      disabled={createCourseMutation.isPending}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-300 mt-1">{errors.price}</p>
                    )}
                    <p className="text-sm text-white/60 mt-1">
                      Set to 0 for free courses
                    </p>
                  </div>

                  <div>
                    <label htmlFor="token" className="block text-sm font-medium text-white mb-2">
                      Token Price
                    </label>
                    <input
                      type="number"
                      id="token"
                      min="0"
                      value={formData.token || ''}
                      onChange={(e) => handleInputChange('token', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors ${
                        errors.token ? 'border-red-300' : 'border-white/20'
                      }`}
                      placeholder="0"
                      disabled={createCourseMutation.isPending}
                    />
                    {errors.token && (
                      <p className="text-sm text-red-300 mt-1">{errors.token}</p>
                    )}
                    <p className="text-sm text-white/60 mt-1">
                      Number of tokens required for enrollment
                    </p>
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-white mb-2">
                      Language
                    </label>
                    <select
                      id="language"
                      value={formData.language || 'English'}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors border-white/20"
                      disabled={createCourseMutation.isPending}
                    >
                      <option value="English" className="text-gray-900">English</option>
                      <option value="Hindi" className="text-gray-900">Hindi</option>
                      <option value="Spanish" className="text-gray-900">Spanish</option>
                      <option value="French" className="text-gray-900">French</option>
                      <option value="German" className="text-gray-900">German</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="instructor" className="block text-sm font-medium text-white mb-2">
                      Instructor *
                    </label>
                    <input
                      type="text"
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => handleInputChange('instructor', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors ${
                        errors.instructor ? 'border-red-300' : 'border-white/20'
                      }`}
                      placeholder="Instructor name"
                      disabled={createCourseMutation.isPending}
                    />
                    {errors.instructor && (
                      <p className="text-sm text-red-300 mt-1">{errors.instructor}</p>
                    )}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-white mb-2">
                    Course Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors border-white/20"
                    placeholder="https://example.com/course-image.jpg"
                    disabled={createCourseMutation.isPending}
                  />
                  <p className="text-sm text-white/60 mt-1">
                    URL to the course thumbnail image
                  </p>
                </div>

                {/* Course Status and Featured */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isActive"
                        type="checkbox"
                        checked={formData.isActive ?? true}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="w-4 h-4 text-orange-600 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                        disabled={createCourseMutation.isPending}
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="isActive" className="text-sm font-medium text-white">
                        Course is Active
                      </label>
                      <p className="text-sm text-white/60">
                        Active courses are visible to students
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isFeatured"
                        type="checkbox"
                        checked={formData.isFeatured ?? false}
                        onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                        className="w-4 h-4 text-orange-600 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                        disabled={createCourseMutation.isPending}
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="isFeatured" className="text-sm font-medium text-white">
                        Mark as Featured Course
                      </label>
                      <p className="text-sm text-white/60">
                        Featured courses will be highlighted on the homepage
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="rounded-lg shadow-sm border border-white/10 p-6" style={{background: '#051C7F'}}>
              <div className="flex items-center mb-6">
                <Target className="w-5 h-5 text-white mr-3" />
                <h2 className="text-xl font-bold text-white">Learning Outcomes</h2>
              </div>

              <div className="space-y-4">
                {(formData.learningOutcomes || []).map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => updateArrayItem('learningOutcomes', index, e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors border-white/20"
                      placeholder="What will students learn?"
                      disabled={createCourseMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('learningOutcomes', index)}
                      className="p-2 text-red-300 hover:text-red-500 transition-colors"
                      disabled={createCourseMutation.isPending}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('learningOutcomes')}
                  className="flex items-center px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80"
                  style={{background: '#EB8216'}}
                  disabled={createCourseMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Learning Outcome
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-lg shadow-sm border border-white/10 p-6" style={{background: '#051C7F'}}>
              <div className="flex items-center mb-6">
                <Trophy className="w-5 h-5 text-white mr-3" />
                <h2 className="text-xl font-bold text-white">Course Benefits</h2>
              </div>

              <div className="space-y-4">
                {(formData.benefits || []).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-lg bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors border-white/20"
                      placeholder="Course benefit (e.g., Certificate of Completion)"
                      disabled={createCourseMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('benefits', index)}
                      className="p-2 text-red-300 hover:text-red-500 transition-colors"
                      disabled={createCourseMutation.isPending}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('benefits')}
                  className="flex items-center px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80"
                  style={{background: '#EB8216'}}
                  disabled={createCourseMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Benefit
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/courses')}
                disabled={createCourseMutation.isPending}
                className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCourseMutation.isPending}
                className="px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                style={{background: '#EB8216'}}
              >
                {createCourseMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Course...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}