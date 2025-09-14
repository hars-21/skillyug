'use client'

import React from 'react';
import Navbar from '../../components/Navbar';
import { Users, Target, Award, Heart } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      <Navbar />
      <div className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About Skillyug
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We are passionate about empowering learners with the skills they need to succeed in today&apos;s rapidly evolving world.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8">
              <Target className="h-12 w-12 text-orange-500 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300">
                To democratize education by providing high-quality, accessible learning experiences that empower individuals to achieve their career goals and personal aspirations.
              </p>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8">
              <Award className="h-12 w-12 text-orange-500 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-4">Our Vision</h2>
              <p className="text-gray-300">
                To become the leading platform for skill development, creating a world where everyone has access to quality education and mentorship.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Heart className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Passion</h3>
                <p className="text-gray-300">We are passionate about learning and helping others succeed.</p>
              </div>
              <div className="text-center">
                <Users className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
                <p className="text-gray-300">We believe in the power of community and collaboration.</p>
              </div>
              <div className="text-center">
                <Award className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Excellence</h3>
                <p className="text-gray-300">We strive for excellence in everything we do.</p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Meet Our Team</h2>
            <p className="text-gray-300 text-center max-w-2xl mx-auto">
              Our diverse team of educators, developers, and mentors work together to create the best learning experience for our students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
