'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/AuthContext';
import Navbar from '../../components/Navbar';
import { BookOpen, Clock, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Courses() {
  const router = useRouter();
  const { user } = useAuth();

  const courses = [
    {
      id: 'course_web_dev_001',
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of HTML, CSS, and JavaScript to build modern web applications.',
      instructor: 'John Doe',
      duration: '8 weeks',
      students: 1200,
      rating: 4.8,
      price: 1299,
      image: '/Pics/GroupPic.jpg'
    },
    {
      id: 'course_react_002',
      title: 'React Masterclass',
      description: 'Master React.js with hooks, context, and advanced patterns.',
      instructor: 'Jane Smith',
      duration: '6 weeks',
      students: 850,
      rating: 4.9,
      price: 1899,
      image: '/Pics/GroupPic.jpg'
    },
    {
      id: 'course_nodejs_003',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js and Express.',
      instructor: 'Mike Johnson',
      duration: '10 weeks',
      students: 650,
      rating: 4.7,
      price: 2599,
      image: '/Pics/GroupPic.jpg'
    }
  ];

  const handleEnrollClick = (course: any) => {
    if (!user) {
      toast.error('Please login to enroll in courses');
      router.push('/login?redirect=' + encodeURIComponent(`/payment?courseId=${course.id}&amount=${course.price}`));
      return;
    }

    router.push(`/payment?courseId=${course.id}&amount=${course.price}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      <Navbar />
      <div className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Courses
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover a wide range of courses designed to help you master new skills and advance your career.
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl overflow-hidden hover:bg-black/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-300 mb-4">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{color: '#EB8216'}}>
                      ₹{course.price.toLocaleString('en-IN')}
                    </span>
                    <button 
                      onClick={() => handleEnrollClick(course)}
                      className="px-6 py-2 text-white rounded-lg transition-colors"
                      style={{background: '#EB8216'}}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#d67214'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#EB8216'}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
