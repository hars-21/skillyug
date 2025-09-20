'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Star,
  Calendar,
  Activity,
  PlusCircle,
  Edit3,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { adminCourseAPI, adminUserAPI } from '@/utils/apiAdmin';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyGrowth: number;
  featuredCourses: number;
  activePurchases: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_purchase' | 'course_created';
  description: string;
  timestamp: string;
  user?: string;
  course?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    featuredCourses: 0,
    activePurchases: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load basic stats
      const [coursesResponse, usersResponse] = await Promise.all([
        adminCourseAPI.getAll({ page: 1, limit: 1 }),
        adminUserAPI.getAll({ page: 1, limit: 1 })
      ]);

      if (coursesResponse.status === 'success' && usersResponse.status === 'success') {
        setStats(prev => ({
          ...prev,
          totalCourses: coursesResponse.meta?.pagination?.total || 0,
          totalUsers: usersResponse.meta?.pagination?.total || 0,
          // TODO: Add revenue and other stats when backend APIs are available
          totalRevenue: 25000, // Mock data
          monthlyGrowth: 12.5, // Mock data
          featuredCourses: 3, // Mock data
          activePurchases: 89 // Mock data
        }));
      }

      // Mock recent activity (replace with real API when available)
      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'john.doe@example.com'
        },
        {
          id: '2',
          type: 'course_purchase',
          description: 'Course purchased',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'jane.smith@example.com',
          course: 'React Fundamentals'
        },
        {
          id: '3',
          type: 'course_created',
          description: 'New course created',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          course: 'Advanced TypeScript'
        }
      ]);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'course_purchase':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'course_created':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/courses/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Course
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
            <span className="text-sm text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-gray-600">{stats.featuredCourses} featured</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8.2%</span>
            <span className="text-sm text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Purchases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activePurchases}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Eye className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-gray-600">View details</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  {activity.user && (
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                  )}
                  {activity.course && (
                    <p className="text-sm text-gray-500">Course: {activity.course}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link 
              href="/admin/activity" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all activity →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <Link 
              href="/admin/courses"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Courses</p>
                <p className="text-xs text-gray-500">View and edit all courses</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/users"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <Users className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Users</p>
                <p className="text-xs text-gray-500">View user accounts and activity</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/analytics"
              className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">View Analytics</p>
                <p className="text-xs text-gray-500">Performance and usage metrics</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/courses/new"
              className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
            >
              <PlusCircle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Create New Course</p>
                <p className="text-xs text-gray-500">Add a new course to the platform</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
