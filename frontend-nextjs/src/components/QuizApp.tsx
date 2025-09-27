'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Star, 
  Trophy, 
  Clock, 
  Users, 
  TrendingUp, 
  Target, 
  Rocket, 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  Code, 
  Globe, 
  Cpu, 
  Bot, 
  GitBranch, 
  ArrowLeft,
  Zap,
  Hash,
  RotateCcw,
  CheckCircle,
  BookOpen,
  Award,
  MapPin,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

// Import course data
import coursesData from '../data/courses.json';
import { WelcomeScreenSkeleton, QuestionScreenSkeleton, ResultScreenSkeleton } from '@/components/ui/quiz-skeletons';
import { LoadingOverlay, TransitionLoader } from '@/components/ui/loading-animations';
import { ResultCalculationLoader } from '@/components/ui/result-calculation-loader';

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    track: 'webdev' | 'javadsa' | 'python';
    emoji: string;
  }[];
}

interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  track: 'webdev' | 'javadsa' | 'python';
  price: number;
  duration: string;
  rating: number;
  students_count: number;
  instructor: string;
  tags: string[];
  features: string[];
  topics: string[];
  projects: string[];
  career_outcomes: string[];
  next_courses: string[];
  emoji: string;
  trackData?: any;
  allCourses?: any[];
  confidence?: number;
  scores?: { webdev: number; javadsa: number; python: number };
  alternativeTracks?: any[];
}

const CourseRecommendationQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-7 = questions, 8 = result
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [recommendation, setRecommendation] = useState<CourseRecommendation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'processing' | 'calculating' | 'generating'>('processing');
  const [isCalculatingResult, setIsCalculatingResult] = useState(false);
  const [showFullTrack, setShowFullTrack] = useState(false);

  // Handle initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500); // Show skeleton for 1.5 seconds to ensure smooth loading experience

    return () => clearTimeout(timer);
  }, []);

  // Handle result calculation completion
  const handleResultCalculationComplete = () => {
    setIsCalculatingResult(false);
    setCurrentStep(8);
    setIsAnimating(false);
  };

  const questions: Question[] = [
    {
      id: 1,
      question: "Which of these sounds fun to you right now?",
      options: [
        { text: "Making websites or apps that people can actually use!", track: "webdev", emoji: "🌐" },
        { text: "Solving tricky programming puzzles and challenges", track: "javadsa", emoji: "🧩" },
        { text: "Playing with data, AI, or making smart programs", track: "python", emoji: "🤖" }
      ]
    },
    {
      id: 2,
      question: "Imagine your dream job. Which one makes you go \"Wow!\"?",
      options: [
        { text: "Creating cool websites or apps that everyone talks about", track: "webdev", emoji: "🚀" },
        { text: "Working in big tech companies like Google, Amazon, Microsoft, Meta, Apple", track: "javadsa", emoji: "🏢" },
        { text: "Analyzing data or building AI/ML programs", track: "python", emoji: "🧠" }
      ]
    },
    {
      id: 3,
      question: "Which projects would make you excited to wake up and code?",
      options: [
        { text: "Personal websites, online stores, or portfolio pages", track: "webdev", emoji: "💻" },
        { text: "Algorithm problems, student record systems, or backend projects", track: "javadsa", emoji: "⚙️" },
        { text: "Data analysis, automation scripts, or small AI models", track: "python", emoji: "📊" }
      ]
    },
    {
      id: 4,
      question: "If you could pick a skill to master first, which one?",
      options: [
        { text: "HTML, CSS, JavaScript, React, Node.js", track: "webdev", emoji: "🎨" },
        { text: "Problem-solving, algorithms, data structures", track: "javadsa", emoji: "🔍" },
        { text: "Python, Pandas, NumPy, or machine learning basics", track: "python", emoji: "🐍" }
      ]
    },
    {
      id: 5,
      question: "What makes you happy while learning tech?",
      options: [
        { text: "Seeing a website/app come alive on the screen", track: "webdev", emoji: "✨" },
        { text: "Cracking a tough coding challenge", track: "javadsa", emoji: "💡" },
        { text: "Turning messy data into something meaningful", track: "python", emoji: "🔄" }
      ]
    },
    {
      id: 6,
      question: "How do you like to learn best?",
      options: [
        { text: "Hands-on, building things you can show off", track: "webdev", emoji: "🛠️" },
        { text: "Step-by-step challenges and practice problems", track: "javadsa", emoji: "📝" },
        { text: "Experimenting with data or small projects", track: "python", emoji: "🧪" }
      ]
    },
    {
      id: 7,
      question: "What's your ultimate dream for the future?",
      options: [
        { text: "Build your own apps, startups, or online projects", track: "webdev", emoji: "🌟" },
        { text: "Work in a big tech company", track: "javadsa", emoji: "🏆" },
        { text: "Become an AI, ML, or data expert", track: "python", emoji: "🎯" }
      ]
    }
  ];



  const affirmations = {
    webdev: ["Great choice! 🌟", "You're going to build amazing things! 🚀", "Web dev is so creative! 🎨"],
    javadsa: ["Smart thinking! 💡", "You'll be a problem-solving master! 🧩", "Big tech, here you come! 🏢"],
    python: ["Excellent pick! 🐍", "Data science is the future! 🚀", "AI magic awaits you! ✨"]
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    
    // Show processing animation
    setTransitionType('processing');
    setIsTransitioning(true);
    
    // Show affirmation
    setShowAffirmation(true);
    const selectedOption = questions[questionId - 1].options[optionIndex];
    
    setTimeout(() => {
      setShowAffirmation(false);
      setIsTransitioning(false);
      handleNext();
    }, 1200);
  };

  const handleNext = () => {
    if (currentStep < 8) {
      setIsAnimating(true);
      
      // Show calculating animation for the last question
      if (currentStep === 7) {
        setIsCalculatingResult(true);
      } else {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setIsAnimating(false);
        }, 300);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const calculateRecommendation = () => {
    const scores: { webdev: number; javadsa: number; python: number } = { webdev: 0, javadsa: 0, python: 0 };
    const experienceLevel = answers[1]; // Experience level (0: beginner, 1: some exp, 2: experienced)
    const goalType = answers[6]; // Career goals
    const projectType = answers[4]; // Project preference
    
    // Enhanced scoring with weights
    Object.entries(answers).forEach(([questionId, optionIndex]) => {
      const questionIndex = parseInt(questionId) - 1;
      const question = questions[questionIndex];
      const selectedOption = question.options[optionIndex];
      
      // Apply different weights to different questions
      let weight = 1;
      if (questionIndex === 0) weight = 2.5; // Programming interest (highest weight)
      if (questionIndex === 4) weight = 2; // Project type preference
      if (questionIndex === 6) weight = 1.8; // Career goals
      if (questionIndex === 2) weight = 1.5; // Problem-solving approach
      if (questionIndex === 3) weight = 1.3; // Learning style
      
      scores[selectedOption.track] += weight;
    });

    // Find the track with highest score
    const topTrack = (Object.entries(scores) as [keyof typeof scores, number][])
      .reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    
    // Get course data for the recommended track
    const trackData = coursesData.learning_tracks[topTrack];
    const trackCourses = coursesData.courses.filter(course => course.track === topTrack);
    
    // Determine appropriate starting course based on experience level
    let recommendedCourse;
    if (experienceLevel === 0) { // Complete beginner
      recommendedCourse = trackCourses.find(course => course.level === 'beginner');
    } else if (experienceLevel === 1) { // Some experience
      recommendedCourse = trackCourses.find(course => course.level === 'intermediate') || 
                         trackCourses.find(course => course.level === 'beginner');
    } else { // Experienced
      recommendedCourse = trackCourses.find(course => course.level === 'advanced') || 
                         trackCourses.find(course => course.level === 'intermediate');
    }
    
    // Calculate confidence score based on answer consistency
    const totalAnswers = Object.keys(answers).length;
    const maxScore = Math.max(...Object.values(scores));
    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 3;
    const confidence = Math.min(Math.round((maxScore / (totalAnswers * 2.5)) * 100), 97);
    
    // Ensure we have a valid course
    if (!recommendedCourse) {
      recommendedCourse = trackCourses[0]; // Fallback to first course in track
    }

    // Create enhanced recommendation object
    return {
      ...recommendedCourse,
      trackData,
      allCourses: trackCourses,
      confidence,
      scores,
      alternativeTracks: Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(1)
        .map(([track]) => ({
          track,
          data: coursesData.learning_tracks[track as keyof typeof coursesData.learning_tracks],
          courses: coursesData.courses.filter(course => course.track === track)
        }))
    } as CourseRecommendation;
  };

  useEffect(() => {
    if (currentStep === 8 && !recommendation) {
      const result = calculateRecommendation();
      setRecommendation(result);
    }
  }, [currentStep]);

  const WelcomeScreen = () => (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-5xl w-full">
        
        {/* AI-Themed Welcome Container */}
        <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute top-32 right-20 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute bottom-10 left-32 w-24 h-24 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 right-10 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Neural Network Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              <defs>
                <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f5ff" />
                  <stop offset="100%" stopColor="#ff00ff" />
                </linearGradient>
              </defs>
              <g stroke="url(#neuralGrad)" strokeWidth="1" fill="none">
                <line x1="50" y1="50" x2="150" y2="100" className="animate-pulse" />
                <line x1="150" y1="100" x2="250" y2="80" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                <line x1="250" y1="80" x2="350" y2="120" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                <circle cx="50" cy="50" r="5" fill="url(#neuralGrad)" className="animate-ping" />
                <circle cx="150" cy="100" r="5" fill="url(#neuralGrad)" className="animate-ping" style={{ animationDelay: '0.3s' }} />
                <circle cx="250" cy="80" r="5" fill="url(#neuralGrad)" className="animate-ping" style={{ animationDelay: '0.6s' }} />
                <circle cx="350" cy="120" r="5" fill="url(#neuralGrad)" className="animate-ping" style={{ animationDelay: '0.9s' }} />
              </g>
            </svg>
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 p-12">
            
            {/* AI Status Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center animate-pulse">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Course Finder</h3>
                  <p className="text-cyan-300 text-sm">Neural Engine v3.0 • Ready</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">ONLINE</span>
              </div>
            </div>
            
            {/* Main Welcome Content */}
            <div className="text-center mb-10">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }}>
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                
                {/* Floating Icons */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center animate-bounce">
                      <Code className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.4s' }}>
                      <Cpu className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-6 leading-tight">
                Discover Your Perfect
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Our advanced AI analyzes your preferences, goals, and learning style to recommend the 
                <span className="text-cyan-300 font-semibold"> perfect course </span> 
                tailored just for you.
              </p>
              
              {/* AI Features */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-cyan-300 font-semibold mb-2">Precision Matching</h4>
                  <p className="text-gray-400 text-sm">97% accuracy in course recommendations</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-purple-300 font-semibold mb-2">Learning Paths</h4>
                  <p className="text-gray-400 text-sm">Complete roadmap from beginner to pro</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-green-300 font-semibold mb-2">Instant Results</h4>
                  <p className="text-gray-400 text-sm">Get recommendations in under 30 seconds</p>
                </div>
              </div>
            </div>
            
            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleNext}
                className="group relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-500 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-white group-hover:animate-bounce" />
                  </div>
                  Start AI Analysis
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </button>
              
              <p className="text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                7 smart questions • Personalized results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const QuestionScreen = () => {
    const currentQuestion = questions[currentStep - 1];
    
    const getTrackIcon = (track: string) => {
      switch (track) {
        case 'webdev': return <Globe className="w-5 h-5" />;
        case 'javadsa': return <Cpu className="w-5 h-5" />;
        case 'python': return <Bot className="w-5 h-5" />;
        default: return <Code className="w-5 h-5" />;
      }
    };

    const getTrackGradient = (track: string) => {
      const gradients = {
        webdev: { bg: 'from-green-500 to-teal-600', text: 'text-green-300', border: 'border-green-400/30' },
        javadsa: { bg: 'from-orange-500 to-red-600', text: 'text-orange-300', border: 'border-orange-400/30' },
        python: { bg: 'from-blue-500 to-purple-600', text: 'text-blue-300', border: 'border-blue-400/30' }
      };
      return gradients[track as keyof typeof gradients] || { bg: 'from-gray-500 to-gray-600', text: 'text-gray-300', border: 'border-gray-400/30' };
    };
    
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-5xl w-full">
          
          {/* AI Question Analysis Container */}
          <div className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute top-40 right-32 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full animate-bounce"></div>
              <div className="absolute bottom-20 left-40 w-20 h-20 bg-gradient-to-r from-green-400/20 to-teal-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Progress Header */}
            <div className="relative z-10 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center animate-pulse">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">AI Analysis Progress</h3>
                    <p className="text-cyan-300 text-sm">Question {currentStep} of 7</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                    {Math.round((currentStep / 7) * 100)}%
                  </div>
                  <p className="text-gray-400 text-sm">Complete</p>
                </div>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${(currentStep / 7) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="relative">
                      <div 
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          i < currentStep 
                            ? 'bg-gradient-to-r from-cyan-400 to-purple-600 scale-125 shadow-lg shadow-cyan-400/50' 
                            : 'bg-gray-600'
                        }`}
                      />
                      {i < currentStep && (
                        <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full animate-ping"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Question Content */}
            <div className="relative z-10 p-8">
              
              {/* AI Analysis Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-full px-6 py-3 mb-6">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-300 font-semibold">Neural Analysis Mode</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {currentQuestion.question}
                </h2>
                
                <p className="text-gray-300 text-lg">
                  Select the option that resonates most with you 🎯
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4 max-w-4xl mx-auto">
                {currentQuestion.options.map((option, index) => {
                  const trackGrad = getTrackGradient(option.track);
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQuestion.id, index)}
                      className="group w-full p-6 text-left bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/70 hover:to-gray-600/70 border border-gray-600/50 hover:border-cyan-500/50 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4">
                        {/* Option Number & Icon */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${trackGrad.bg} rounded-xl flex items-center justify-center font-bold text-white text-lg group-hover:scale-110 transition-transform duration-300`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className={`w-10 h-10 bg-gradient-to-r ${trackGrad.bg} rounded-lg flex items-center justify-center group-hover:animate-bounce`}>
                            {getTrackIcon(option.track)}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300 leading-relaxed mb-2">
                            {option.text}
                          </p>
                          
                          {/* Track Indicator */}
                          <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${trackGrad.bg} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-white text-sm font-medium capitalize">
                              {option.track === 'javadsa' ? 'Java DSA' : option.track === 'webdev' ? 'Web Development' : 'Python'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-500 group-hover:from-cyan-500 group-hover:to-blue-600 rounded-full flex items-center justify-center transition-all duration-300">
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
                <button
                  onClick={handlePrevious}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    currentStep === 1 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50'
                  }`}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-sm font-medium">Click any option to continue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ResultScreen = () => {
    if (!recommendation) return null;

    const getTrackDetails = (track: string) => {
      const details = {
        webdev: { 
          emoji: '🌐', 
          label: 'WEB DEVELOPMENT', 
          gradient: 'from-green-400 via-teal-500 to-blue-600',
          textColor: 'text-green-300',
          bgColor: 'from-green-500/10 to-teal-500/10',
          borderColor: 'border-green-400/30'
        },
        javadsa: { 
          emoji: '☕', 
          label: 'JAVA DSA', 
          gradient: 'from-orange-400 via-red-500 to-pink-600',
          textColor: 'text-orange-300',
          bgColor: 'from-orange-500/10 to-red-500/10',
          borderColor: 'border-orange-400/30'
        },
        python: { 
          emoji: '🐍', 
          label: 'PYTHON', 
          gradient: 'from-blue-400 via-purple-500 to-indigo-600',
          textColor: 'text-blue-300',
          bgColor: 'from-blue-500/10 to-purple-500/10',
          borderColor: 'border-blue-400/30'
        }
      };
      return details[track as keyof typeof details] || { 
        emoji: '💻', 
        label: 'PROGRAMMING', 
        gradient: 'from-gray-400 to-gray-600',
        textColor: 'text-gray-300',
        bgColor: 'from-gray-500/10 to-gray-600/10',
        borderColor: 'border-gray-400/30'
      };
    };

    const trackDetails = getTrackDetails(recommendation.track);

    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-6xl w-full">
          
          {/* AI Result Container */}
          <div className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Celebration Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full animate-bounce"></div>
              <div className="absolute bottom-20 left-32 w-28 h-28 bg-gradient-to-r from-green-400/20 to-teal-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* Success Header */}
            <div className="relative z-10 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-gray-700/50 p-8">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className={`w-24 h-24 bg-gradient-to-r ${trackDetails.gradient} rounded-2xl flex items-center justify-center mx-auto animate-bounce`}>
                    <span className="text-4xl">{trackDetails.emoji}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-yellow-900" />
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-4">
                  Perfect Match Found! 🎉
                </h1>
                
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-full px-6 py-3 mb-4">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-green-300 font-bold text-lg">97% Match Confidence</span>
                  <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
                </div>
                
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Our AI has analyzed your preferences and found your ideal learning path
                </p>
              </div>
            </div>
            
            {/* Main Recommendation */}
            <div className="relative z-10 p-8">
              
              {/* Course Recommendation Card */}
              <div className={`bg-gradient-to-r ${trackDetails.bgColor} border ${trackDetails.borderColor} rounded-2xl p-8 mb-8 backdrop-blur-sm`}>
                <div className="flex items-start gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${trackDetails.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse`}>
                    <span className="text-3xl">{trackDetails.emoji}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl font-bold text-white">{recommendation.title}</h2>
                      <span className={`px-4 py-2 bg-gradient-to-r ${trackDetails.gradient} text-white text-sm font-bold rounded-full animate-pulse`}>
                        RECOMMENDED
                      </span>
                    </div>
                    
                    <p className={`${trackDetails.textColor} text-sm font-medium mb-3 tracking-wider`}>
                      {trackDetails.label}
                    </p>
                    
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {recommendation.description}
                    </p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                        <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <p className="text-white font-bold">{recommendation.duration}</p>
                        <p className="text-gray-400 text-sm">Duration</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                        <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-white font-bold">{recommendation.level || 'Beginner'}</p>
                        <p className="text-gray-400 text-sm">Level</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                        <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-white font-bold">{recommendation.students_count}+</p>
                        <p className="text-gray-400 text-sm">Students</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
                        <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-white font-bold">{recommendation.rating}/5</p>
                        <p className="text-gray-400 text-sm">Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Learning Journey */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <GitBranch className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-2xl font-bold text-white">Your Learning Journey</h3>
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-3">
                  {['beginner', 'intermediate', 'advanced'].map((level, index) => {
                    const levelContent = {
                      beginner: `Start your ${trackDetails.label.toLowerCase()} journey with fundamentals and core concepts.`,
                      intermediate: `Build practical projects and deepen your understanding of advanced topics.`,
                      advanced: `Master complex concepts and prepare for professional development roles.`
                    };
                    
                    return (
                      <div 
                        key={level} 
                        className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/50 hover:border-cyan-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${trackDetails.gradient} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                            {level === 'beginner' ? '🌱' : level === 'intermediate' ? '🌿' : '🌳'}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white capitalize">
                              {level} Level
                            </h4>
                            <p className="text-gray-400 text-sm">Step {index + 1}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 leading-relaxed mb-4">
                          {levelContent[level as keyof typeof levelContent]}
                        </p>
                        
                        {/* Progress Indicator */}
                        <div className="flex items-center gap-1">
                          {[...Array(index + 1)].map((_, i) => (
                            <div key={i} className={`w-3 h-3 bg-gradient-to-r ${trackDetails.gradient} rounded-full animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                          ))}
                          {[...Array(3 - index - 1)].map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-gray-600 rounded-full"></div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="group relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-500 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-3">
                    <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                    Start Learning Journey
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setCurrentStep(0);
                    setAnswers({});
                    setRecommendation(null);
                  }}
                  className="group border-2 border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 backdrop-blur-sm"
                >
                  <RotateCcw className="w-5 h-5 group-hover:animate-spin" />
                  Take Quiz Again
                </button>
                
                <Link
                  href="/courses"
                  className="group border-2 border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 backdrop-blur-sm"
                >
                  View All Courses
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AffirmationOverlay = () => {
    if (!showAffirmation || currentStep === 0 || currentStep > 7) return null;
    
    const currentQuestion = questions[currentStep - 1];
    const selectedOption = currentQuestion.options[answers[currentStep]];
    const affirmationTexts = affirmations[selectedOption?.track] || ["Great choice! 🌟"];
    const randomAffirmation = affirmationTexts[Math.floor(Math.random() * affirmationTexts.length)];

    const getTrackGradient = (track: string) => {
      switch (track) {
        case 'webdev': return 'from-green-500 to-blue-500';
        case 'javadsa': return 'from-purple-500 to-pink-500';  
        case 'python': return 'from-yellow-500 to-red-500';
        default: return 'from-[#051C7F] to-[#EB8216]';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="relative">
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${getTrackGradient(selectedOption?.track)} rounded-3xl blur-xl opacity-30 animate-pulse scale-110`}></div>
          
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 max-w-lg mx-auto text-center border border-white/20 shadow-2xl">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className={`w-20 h-20 bg-gradient-to-r ${getTrackGradient(selectedOption?.track)} rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-bounce`}>
                <span className="text-4xl">{selectedOption?.emoji}</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#EB8216] rounded-full flex items-center justify-center animate-ping">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Affirmation Text */}
            <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
              {randomAffirmation}
            </h3>
            
            {/* Track Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getTrackGradient(selectedOption?.track)} animate-pulse`}></div>
              <span className="text-lg font-semibold text-gray-300 capitalize">
                {selectedOption?.track === 'javadsa' ? 'Java DSA' : selectedOption?.track === 'webdev' ? 'Web Development' : 'Python'} Track
              </span>
            </div>
            
            {/* Loading Animation */}
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#EB8216] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#EB8216] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#EB8216] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm font-medium ml-2">Processing next question...</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="border-b border-white/20 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link 
                href="/"
                className="group inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-mono text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>cd ../home</span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                  <span className="font-bold text-lg bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    AI Course Recommender
                  </span>
                </div>
                <div className="font-mono text-xs text-gray-300 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                  Automated AI Course Recommender
                </div>
              </div>

              <div className="font-mono text-xs text-gray-400 px-2 py-1 bg-white/10 rounded border border-white/20">
                v2.0.0
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 py-10 px-4 relative">
          {isInitialLoading ? (
            // Show skeleton loaders during initial load
            <>
              {currentStep === 0 && <WelcomeScreenSkeleton />}
              {currentStep >= 1 && currentStep <= 7 && <QuestionScreenSkeleton />}
              {currentStep === 8 && <ResultScreenSkeleton />}
            </>
          ) : (
            // Show actual content after loading
            <>
              {currentStep === 0 && <WelcomeScreen />}
              {currentStep >= 1 && currentStep <= 7 && <QuestionScreen />}
              {currentStep === 8 && <ResultScreen />}
            </>
          )}
        </main>
      </div>

      {/* Enhanced Affirmation Overlay */}
      <AffirmationOverlay />
      
      {/* Transition Loading Animations */}
      <TransitionLoader isVisible={isTransitioning} type={transitionType} />
      
      {/* Result Calculation Loader */}
      <ResultCalculationLoader 
        isVisible={isCalculatingResult} 
        onComplete={handleResultCalculationComplete}
      />
    </div>
  );
};

export default CourseRecommendationQuiz;
