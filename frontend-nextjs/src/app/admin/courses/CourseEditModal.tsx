'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { adminCourseAPI, AdminCourse, UpdateCourseInput } from '@/utils/apiAdmin';

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: AdminCourse;
}

interface FormErrors {
  [key: string]: string;
}

export default function CourseEditModal({ isOpen, onClose, onSuccess, course }: CourseEditModalProps) {
  const [formData, setFormData] = useState<UpdateCourseInput>({
    title: course.title,
    description: course.description,
    category: course.category,
    difficulty: course.difficulty,
    price: course.price,
    featured: course.featured,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Reset form when course changes
  useEffect(() => {
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      price: course.price,
      featured: course.featured,
    });
    setErrors({});
    setSubmitError(null);
  }, [course]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Course title must be at least 5 characters';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const response = await adminCourseAPI.update(course.id, formData);
      
      if (response.status === 'success') {
        onSuccess();
        handleClose();
      } else {
        setSubmitError(response.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      setSubmitError(null);
      onClose();
    }
  };

  const handleInputChange = (field: keyof UpdateCourseInput, value: any) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
            <p className="text-sm text-gray-600 mt-1">Course ID: {course.id}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error updating course</h3>
                <p className="text-sm text-red-700 mt-1">{submitError}</p>
              </div>
            </div>
          )}

          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter course title"
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Course Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Describe what students will learn in this course"
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {(formData.description || '').length}/500 characters
            </p>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                value={formData.difficulty || ''}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.difficulty ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select difficulty</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
              {errors.difficulty && (
                <p className="text-sm text-red-600 mt-1">{errors.difficulty}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Course Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              min="0"
              step="1"
              value={formData.price || 0}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="0"
              disabled={loading}
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">{errors.price}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Set to 0 for free courses
            </p>
          </div>

          {/* Featured Course */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                disabled={loading}
              />
            </div>
            <div className="ml-3">
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Mark as Featured Course
              </label>
              <p className="text-sm text-gray-500">
                Featured courses will be highlighted on the homepage
              </p>
            </div>
          </div>

          {/* Course Stats (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Course Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium">{new Date(course.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Enrollments:</span>
                <p className="font-medium">{course.enrollmentCount || 0}</p>
              </div>
              <div>
                <span className="text-gray-500">Completion Rate:</span>
                <p className="font-medium">{course.completionRate || 0}%</p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Course'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}