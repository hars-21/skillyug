'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Award, TrendingUp, ArrowRight } from 'lucide-react';
import WordRotator from '../components/ExtraComponents/WordRotator';
import Navbar from '../components/Navbar';

/* Typewriter Hook */
function useTypewriter(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index))
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
}

const rotatingWords = [
  'Mentorship',
  'Motivation',
  'Moneyback',
  'Support',
  'Growth',
  'Success',
];

export default function Home() {
  const animatedText = useTypewriter("Master New Skills from SkillYug ", 100);

  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with years of experience'
    },
    {
      icon: Users,
      title: 'Mentorship Program',
      description: 'Get personalized guidance from experienced mentors'
    },
    {
      icon: Award,
      title: 'Certification',
      description: 'Earn recognized certifications upon course completion'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Accelerate your career with in-demand skills'
    }
  ];

  // const stats = [
  //   { number: '10K+', label: 'Students' },
  //   { number: '500+', label: 'Courses' },
  //   { number: '100+', label: 'Mentors' },
  //   { number: '95%', label: 'Success Rate' }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      <Navbar />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {animatedText}
              <span className="text-orange-500 cursor pb-12">|</span>
              <br />
              with guaranteed <WordRotator words={rotatingWords} />
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of learners on Skillyug and unlock your potential with expert-led courses,
              personalized mentorship, and industry-recognized certifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Explore Courses
                <ArrowRight className="ml-2" />
              </Link>
              <Link
                href="/sign-up"
                className="px-8 py-4 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why Choose Skillyug?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                We provide everything you need to succeed in your learning journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-xl p-6 text-center hover:bg-black/40 transition-all duration-300 transform hover:scale-105"
                >
                  <feature.icon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 backdrop-blur-md border border-blue-700/30 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join our community of learners and take the first step towards your dream career
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/join-our-team"
                  className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
                >
                  Join Our Team
                </Link>
                <Link
                  href="/emotional-connect"
                  className="px-8 py-4 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
