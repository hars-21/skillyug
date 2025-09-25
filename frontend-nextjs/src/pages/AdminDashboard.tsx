'use client'

import React from 'react';
import { useAuth } from "../hooks/AuthContext";
import { LogOut, Users, BookOpen, BarChart3, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900/50 p-6 flex flex-col flex-shrink-0">
        <div className="mb-8">
          <Image
            src="/logo/Logo.png"
            alt="Skill Yug Logo"
            width={48}
            height={48}
            className="h-12 w-auto bg-white p-2 rounded-lg"
          />
        </div>
        <nav className="flex flex-col space-y-3 flex-grow">
          <button className="w-full text-left p-3 bg-orange-500 rounded-lg font-semibold">Dashboard</button>
          <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Users</button>
          <button 
            onClick={() => router.push('/admin/courses')}
            className="w-full text-left p-3 hover:bg-blue-800 rounded-lg"
          >
            Courses
          </button>
          <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Analytics</button>
          <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Settings</button>
        </nav>
        <div>
          <button 
            onClick={signOut}
            className="w-full text-left p-3 border border-blue-700 hover:bg-blue-800 rounded-lg flex items-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
          
          {/* Welcome Message */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome, {profile?.full_name || 'Admin'}!
            </h2>
            <p className="text-gray-300">
              Manage your platform and oversee all activities.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <Users className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">1,234</h3>
              <p className="text-gray-300">Total Users</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <BookOpen className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">56</h3>
              <p className="text-gray-300">Total Courses</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <BarChart3 className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">89%</h3>
              <p className="text-gray-300">Completion Rate</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <Settings className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">12</h3>
              <p className="text-gray-300">Active Mentors</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-300">New user registered</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Course completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Payment received</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/admin/courses')}
                  className="w-full text-left p-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add New Course
                </button>
                <button className="w-full text-left p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Users
                </button>
                <button className="w-full text-left p-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Disable static generation to prevent AuthProvider issues during build
export async function getServerSideProps() {
  return {
    props: {}
  };
}

export default AdminDashboard;
