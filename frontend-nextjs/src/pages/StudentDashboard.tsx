'use client'

import React, { useState } from 'react';
import { useAuth } from "../hooks/AuthContext";
import { LogOut, Book, Gamepad, MessageSquare } from 'lucide-react';
import Image from 'next/image';

// ## Sidebar Component Definition ##
const Sidebar = () => {
  const { signOut } = useAuth();
  
  const handleLogout = () => {
    signOut();
  };

  return (
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
        <button className="w-full text-left p-3 bg-orange-500 rounded-lg font-semibold">Profile</button>
        <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Your Course</button>
        <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">All Course</button>
        <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Quiz/Games</button>
        <button className="w-full text-left p-3 hover:bg-blue-800 rounded-lg">Contact us</button>
      </nav>
      <div>
        <button 
          onClick={handleLogout}
          className="w-full text-left p-3 border border-blue-700 hover:bg-blue-800 rounded-lg flex items-center space-x-2"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

// ## Main Content Component Definition ##
const MainContent = () => {
  const { user, profile, createProfileForCurrentUser } = useAuth();
  const [creatingProfile, setCreatingProfile] = useState(false);

  const handleCreateProfile = async () => {
    setCreatingProfile(true);
    try {
      await createProfileForCurrentUser();
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setCreatingProfile(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Student Dashboard</h1>
        
        {/* Profile Status */}
        {!profile && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">Profile Setup Required</h2>
            <p className="text-gray-300 mb-4">
              You need to create a profile to access all features.
            </p>
            <button
              onClick={handleCreateProfile}
              disabled={creatingProfile}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {creatingProfile ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        )}

        {/* Welcome Message */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome, {profile?.full_name || user?.email || 'Student'}!
          </h2>
          <p className="text-gray-300">
            Ready to start your learning journey? Explore our courses and enhance your skills.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 hover:bg-black/40 transition-all duration-300">
            <Book className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">My Courses</h3>
            <p className="text-gray-300 mb-4">View and continue your enrolled courses</p>
            <button className="text-orange-500 hover:text-orange-400 font-medium">
              View Courses →
            </button>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 hover:bg-black/40 transition-all duration-300">
            <Gamepad className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Quiz & Games</h3>
            <p className="text-gray-300 mb-4">Test your knowledge with interactive quizzes</p>
            <button className="text-orange-500 hover:text-orange-400 font-medium">
              Start Quiz →
            </button>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 hover:bg-black/40 transition-all duration-300">
            <MessageSquare className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Support</h3>
            <p className="text-gray-300 mb-4">Get help from our support team</p>
            <button className="text-orange-500 hover:text-orange-400 font-medium">
              Contact Us →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ## Main StudentDashboard Component ##
const StudentDashboard = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      <Sidebar />
      <MainContent />
    </div>
  );
};

// Disable static generation to prevent AuthProvider issues during build
export async function getServerSideProps() {
  return {
    props: {}
  };
}

export default StudentDashboard;
