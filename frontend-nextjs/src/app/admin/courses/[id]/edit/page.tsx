'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Eye } from 'lucide-react';
import { adminCourseAPI, AdminCourse, UpdateCourseInput } from '@/utils/apiAdmin';

interface FormErrors {
  [key: string]: string;
}

export default function CourseEditPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [formData, setFormData] = useState<UpdateCourseInput>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = [
    'web-development',
    'mobile-development', 
    'data-science',
    'artificial-intelligence',
    'cloud-computing',
    'cybersecurity',
    'design',
    'business',
    'marketing',
    'other'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await adminCourseAPI.getById(courseId);
        if (response.status === 'success' && response.data) {
          const courseData = response.data;
          setCourse(courseData);
          setFormData({
            courseName: courseData.courseName,
            description: courseData.description,
            category: courseData.category,
            difficulty: courseData.difficulty,
            price: courseData.price,
            isFeatured: courseData.isFeatured,
            isActive: courseData.isActive,
            imageUrl: courseData.imageUrl,
            language: courseData.language,
            durationHours: courseData.durationHours,
          });
        } else {
          setSubmitError('Failed to load course details');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setSubmitError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.courseName?.trim()) {
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

    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.durationHours !== undefined && formData.durationHours < 0) {
      newErrors.durationHours = 'Duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const response = await adminCourseAPI.update(courseId, formData);
      
      if (response.status === 'success') {
        setSuccessMessage('Course updated successfully!');
        // Update the course state with the new data
        if (response.data) {
          setCourse(response.data);
        }
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setSubmitError(response.message || 'Failed to update course');
      }
    } catch (error: unknown) {
      console.error('Update error:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          setSubmitError(apiError.response.data.message);
        } else {
          setSubmitError('An unexpected error occurred while updating the course');
        }
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An unexpected error occurred while updating the course');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateCourseInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2741D6] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">Loading course details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#2741D6] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#051C7F] rounded-lg p-6 text-center">
            <h1 className="text-white text-xl mb-4">Course Not Found</h1>
            <p className="text-white/70 mb-6">The requested course could not be found.</p>
            <Link
              href="/admin/courses"
              className="inline-flex items-center px-4 py-2 bg-[#EB8216] text-white rounded-lg hover:bg-[#EB8216]/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2741D6] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/admin/courses/${courseId}`}
            className="inline-flex items-center px-4 py-2 bg-[#051C7F] text-white rounded-lg hover:bg-[#051C7F]/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to View
          </Link>
          
          <Link
            href={`/admin/courses/${courseId}`}
            className="inline-flex items-center px-4 py-2 bg-[#051C7F] text-white rounded-lg hover:bg-[#051C7F]/80 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Course
          </Link>
        </div>

        {/* Form */}
        <div className="bg-[#051C7F] rounded-lg p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Edit Course</h1>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-400">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Name */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Course Name *
              </label>
              <input
                type="text"
                value={formData.courseName || ''}
                onChange={(e) => handleInputChange('courseName', e.target.value)}
                className={`w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border ${
                  errors.courseName ? 'border-red-500' : 'border-[#2741D6]'
                } focus:outline-none focus:border-[#EB8216] transition-colors`}
                placeholder="Enter course name"
              />
              {errors.courseName && (
                <p className="mt-1 text-red-400 text-sm">{errors.courseName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border ${
                  errors.description ? 'border-red-500' : 'border-[#2741D6]'
                } focus:outline-none focus:border-[#EB8216] transition-colors resize-vertical`}
                placeholder="Enter course description"
              />
              {errors.description && (
                <p className="mt-1 text-red-400 text-sm">{errors.description}</p>
              )}
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Category *
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border ${
                    errors.category ? 'border-red-500' : 'border-[#2741D6]'
                  } focus:outline-none focus:border-[#EB8216] transition-colors`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-red-400 text-sm">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty || ''}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border ${
                    errors.difficulty ? 'border-red-500' : 'border-[#2741D6]'
                  } focus:outline-none focus:border-[#EB8216] transition-colors`}
                >
                  <option value="">Select difficulty</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p className="mt-1 text-red-400 text-sm">{errors.difficulty}</p>
                )}
              </div>
            </div>

            {/* Price and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border ${
                    errors.price ? 'border-red-500' : 'border-[#2741D6]'
                  } focus:outline-none focus:border-[#EB8216] transition-colors`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-red-400 text-sm">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.durationHours || ''}
                  onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value) || undefined)}
                  className={`w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border ${
                    errors.durationHours ? 'border-red-500' : 'border-[#2741D6]'
                  } focus:outline-none focus:border-[#EB8216] transition-colors`}
                  placeholder="0"
                />
                {errors.durationHours && (
                  <p className="mt-1 text-red-400 text-sm">{errors.durationHours}</p>
                )}
              </div>
            </div>

            {/* Image URL and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border border-[#2741D6] focus:outline-none focus:border-[#EB8216] transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Language
                </label>
                <input
                  type="text"
                  value={formData.language || ''}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2741D6] text-white rounded-lg border border-[#2741D6] focus:outline-none focus:border-[#EB8216] transition-colors"
                  placeholder="English"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured || false}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-5 h-5 text-[#EB8216] bg-[#2741D6] border-[#2741D6] rounded focus:ring-[#EB8216] focus:ring-2"
                />
                <label htmlFor="isFeatured" className="ml-3 text-white font-semibold">
                  Featured Course
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-5 h-5 text-[#EB8216] bg-[#2741D6] border-[#2741D6] rounded focus:ring-[#EB8216] focus:ring-2"
                />
                <label htmlFor="isActive" className="ml-3 text-white font-semibold">
                  Active Course
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-[#EB8216] text-white rounded-lg hover:bg-[#EB8216]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}