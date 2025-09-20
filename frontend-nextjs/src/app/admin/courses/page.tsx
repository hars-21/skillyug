'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Star,
  StarOff,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { adminCourseAPI, AdminCourse, PaginatedAdminResponse } from '@/utils/apiAdmin';
import CourseCreateModal from './CourseCreateModal';
import CourseEditModal from './CourseEditModal';

export default function CoursesManagement() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadCourses();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const response = await adminCourseAPI.getAll(params);

      if (response.status === 'success') {
        setCourses(response.data || []);
        setTotalPages(Math.ceil((response.meta?.pagination?.total || 0) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load courses');
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminCourseAPI.delete(courseId);
      if (response.status === 'success') {
        setCourses(courses.filter(course => course.id !== courseId));
      } else {
        alert(response.message || 'Failed to delete course');
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };

  const handleToggleFeatured = async (courseId: string) => {
    try {
      const response = await adminCourseAPI.toggleFeatured(courseId);
      if (response.status === 'success') {
        setCourses(courses.map(course => 
          course.id === courseId 
            ? { ...course, featured: !course.featured }
            : course
        ));
      } else {
        alert(response.message || 'Failed to update course');
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      alert('Failed to update course. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const CourseCard = ({ course }: { course: AdminCourse }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="aspect-video bg-gray-100 relative">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {course.featured && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{course.title}</h3>
          <div className="relative ml-2">
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {course.enrollmentCount || 0}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {formatCurrency(course.price)}
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {course.difficulty}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Updated {formatDate(course.updatedAt)}
          </span>
          <div className="flex gap-2">
            <Link 
              href={`/admin/courses/${course.id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View/Edit Course"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link 
              href={`/admin/courses/${course.id}/edit`}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Edit Course"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSelectedCourse(course);
                setShowEditModal(true);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Quick Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToggleFeatured(course.id)}
              className={`p-2 rounded-lg transition-colors ${
                course.featured 
                  ? 'text-yellow-600 hover:bg-yellow-50' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={course.featured ? 'Remove from Featured' : 'Add to Featured'}
            >
              {course.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleDeleteCourse(course.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
          <p className="text-gray-600 mt-1">Manage all courses on your platform</p>
        </div>
        <Link 
          href="/admin/courses/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Course
        </Link>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Add
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="data-science">Data Science</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory || selectedStatus 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first course'
            }
          </p>
          <Link 
            href="/admin/courses/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Course Create Modal */}
      <CourseCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadCourses(); // Refresh the courses list
          setShowCreateModal(false);
        }}
      />

      {/* Course Edit Modal */}
      {selectedCourse && (
        <CourseEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={() => {
            loadCourses(); // Refresh the courses list
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
        />
      )}
    </div>
  );
}
