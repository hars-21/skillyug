'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit3, Calendar, DollarSign, Users, Star, Book, Clock, Target, User } from 'lucide-react';
import { adminCourseAPI, AdminCourse } from '@/utils/apiAdmin';

export default function CourseViewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await adminCourseAPI.getById(courseId);
        if (response.status === 'success' && response.data) {
          setCourse(response.data);
          console.log('Fetched course:', response.data);
        } else {
          setError('Failed to load course details');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2741D6] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">Loading course details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2741D6] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#051C7F] rounded-lg p-6 text-center">
            <h1 className="text-white text-xl mb-4">Error Loading Course</h1>
            <p className="text-white/70 mb-6">{error}</p>
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

  if (!course) {
    return (
      <div className="min-h-screen bg-[#2741D6] p-6">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin/courses"
            className="inline-flex items-center px-4 py-2 bg-[#051C7F] text-white rounded-lg hover:bg-[#051C7F]/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
          
          <Link
            href={`/admin/courses/${courseId}/edit`}
            className="inline-flex items-center px-4 py-2 bg-[#EB8216] text-white rounded-lg hover:bg-[#EB8216]/90 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Course
          </Link>
        </div>

        {/* Course Details Card */}
        <div className="bg-[#051C7F] rounded-lg p-8 shadow-lg">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{course.courseName}</h1>
              <div className="flex items-center space-x-4">
                {course.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 bg-[#EB8216] text-white text-sm rounded-full">
                    <Star className="w-4 h-4 mr-1" />
                    Featured
                  </span>
                )}
                <span className={`px-3 py-1 text-sm rounded-full ${
                  course.isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <p className="text-white/70 text-lg leading-relaxed">{course.description}</p>
          </div>

          {/* Course Image and Mentor Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Course Image */}
            <div className="bg-[#2741D6] rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">Course Image</h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt={course.courseName}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                    <Book className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Mentor Details */}
            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Mentor Details</h3>
              </div>
              {course.mentor ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-sm">Name</p>
                    <p className="text-white font-medium">{course.mentor.name}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Email</p>
                    <p className="text-white font-medium">{course.mentor.email}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Mentor ID</p>
                    <p className="text-white/70 font-mono text-sm">{course.mentor.id}</p>
                  </div>
                </div>
              ) : (
                <p className="text-white/60">No mentor assigned</p>
              )}
            </div>

            {/* Course Duration */}
            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Duration</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-sm">Total Hours</p>
                  <p className="text-white text-2xl font-bold">{course.durationHours || 0}h</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Language</p>
                  <p className="text-white font-medium">{course.language}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Price</h3>
              </div>
              <p className="text-white text-xl font-bold">{formatPrice(course.price)}</p>
            </div>

            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Difficulty</h3>
              </div>
              <p className="text-white text-lg capitalize">{course.difficulty}</p>
            </div>

            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Book className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Category</h3>
              </div>
              <p className="text-white text-lg capitalize">{course?.category?.replace('-', ' ')}</p>
            </div>

            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Enrollments</h3>
              </div>
              <p className="text-white text-xl font-bold">{course.enrollmentCount || 0}</p>
            </div>
          </div>

          {/* Additional Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Rating</h3>
              </div>
              <p className="text-white text-xl font-bold">{course.ratingAverage}/5</p>
              <p className="text-white/60 text-sm">({course.reviewCount} reviews)</p>
            </div>

            {course.completionRate && (
              <div className="bg-[#2741D6] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Target className="w-5 h-5 text-[#EB8216] mr-2" />
                  <h3 className="text-white font-semibold">Completion Rate</h3>
                </div>
                <p className="text-white text-xl font-bold">{course.completionRate}%</p>
              </div>
            )}

            {course.token && (
              <div className="bg-[#2741D6] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-[#EB8216] mr-2" />
                  <h3 className="text-white font-semibold">Tokens</h3>
                </div>
                <p className="text-white text-xl font-bold">{course.token}</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Created</h3>
              </div>
              <p className="text-white">{formatDate(course.createdAt)}</p>
            </div>

            <div className="bg-[#2741D6] rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-[#EB8216] mr-2" />
                <h3 className="text-white font-semibold">Last Updated</h3>
              </div>
              <p className="text-white">{formatDate(course.updatedAt)}</p>
            </div>
          </div>

          {/* Course ID */}
          <div className="bg-[#2741D6] rounded-lg p-4">
            <div className="flex items-center mb-2">
              <h3 className="text-white font-semibold">Course ID</h3>
            </div>
            <p className="text-white/70 font-mono text-sm">{course.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}