'use client'

import React from 'react';
import { useAuth } from "../hooks/AuthContext";
import { LogOut, Users, BookOpen, MessageSquare, BarChart3 } from 'lucide-react';
import Image from 'next/image';

const MentorsDashboard = () => {
  const { signOut, profile } = useAuth();

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
          <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">My Students</button>
          <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">My Courses</button>
          <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Messages</button>
          <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Analytics</button>
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
          <h1 className="text-3xl font-bold text-white mb-8">Mentor Dashboard</h1>
          
          {/* Welcome Message */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome, {profile?.full_name || 'Mentor'}!
            </h2>
            <p className="text-gray-300">
              Guide your students and help them achieve their learning goals.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <Users className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">45</h3>
              <p className="text-gray-300">My Students</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <BookOpen className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">8</h3>
              <p className="text-gray-300">My Courses</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <MessageSquare className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">23</h3>
              <p className="text-gray-300">New Messages</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <BarChart3 className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">92%</h3>
              <p className="text-gray-300">Student Satisfaction</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Student Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-300">John completed Module 3</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Sarah asked a question</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Mike submitted assignment</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
                  Create New Course
                </button>
                <button className="w-full text-left p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  View Messages
                </button>
                <button className="w-full text-left p-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                  Check Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorsDashboard;
