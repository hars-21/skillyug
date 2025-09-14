'use client'

import React from 'react';
import Navbar from '../../components/Navbar';
import { Users, BookOpen, MessageSquare, Send } from 'lucide-react';

export default function JoinOurTeam() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      <Navbar />
      <div className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Be part of our mission to democratize education and help learners achieve their dreams.
            </p>
          </div>

          {/* Why Join Us */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Join Skillyug?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8 text-center">
                <Users className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-4">Make an Impact</h3>
                <p className="text-gray-300">
                  Help thousands of learners achieve their goals and transform their lives through education.
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8 text-center">
                <BookOpen className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-4">Continuous Learning</h3>
                <p className="text-gray-300">
                  Grow your own skills while teaching others. We invest in our team&apos;s professional development.
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8 text-center">
                <MessageSquare className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-4">Collaborative Environment</h3>
                <p className="text-gray-300">
                  Work with passionate educators and developers in a supportive, innovative environment.
                </p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Open Positions</h2>
            <div className="space-y-6">
              <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Senior Web Developer</h3>
                <p className="text-gray-300 mb-4">
                  Lead the development of our learning platform using modern technologies like React, Node.js, and cloud services.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-500 font-medium">Full-time • Remote</span>
                  <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Course Content Creator</h3>
                <p className="text-gray-300 mb-4">
                  Create engaging and educational content for our courses. Experience in instructional design preferred.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-500 font-medium">Part-time • Remote</span>
                  <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Student Success Manager</h3>
                <p className="text-gray-300 mb-4">
                  Help students succeed by providing support, guidance, and mentorship throughout their learning journey.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-500 font-medium">Full-time • Hybrid</span>
                  <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Apply Now</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-blue-900/30 border border-blue-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-blue-900/30 border border-blue-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-blue-900/30 border border-blue-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position of Interest</label>
                <select className="w-full px-4 py-3 bg-blue-900/30 border border-blue-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select a position</option>
                  <option>Senior Web Developer</option>
                  <option>Course Content Creator</option>
                  <option>Student Success Manager</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cover Letter</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-blue-900/30 border border-blue-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tell us why you'd like to join our team..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Submit Application</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
