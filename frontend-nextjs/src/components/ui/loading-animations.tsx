'use client';

import { useState, useEffect } from 'react';
import { Bot, Zap, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Processing your answers..." }: LoadingOverlayProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        {/* Animated Icons */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-[#051C7F] to-[#EB8216] rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-2 -left-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <div className="w-8 h-8 bg-[#EB8216] rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '1s' }}>
            <div className="w-8 h-8 bg-[#051C7F] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900">
            AI Magic in Progress
          </h3>
          <p className="text-gray-600">
            {message}{dots}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#051C7F] to-[#EB8216] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TransitionLoaderProps {
  isVisible: boolean;
  type: 'processing' | 'calculating' | 'generating';
}

export function TransitionLoader({ isVisible, type }: TransitionLoaderProps) {
  const messages = {
    processing: "Processing your answer",
    calculating: "Calculating your perfect match",
    generating: "Generating personalized recommendations"
  };

  const icons = {
    processing: <Zap className="w-6 h-6 text-white" />,
    calculating: <Bot className="w-6 h-6 text-white" />,
    generating: <Sparkles className="w-6 h-6 text-white" />
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#051C7F]/20 to-[#EB8216]/20 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#051C7F] to-[#EB8216] rounded-lg flex items-center justify-center animate-spin">
            {icons[type]}
          </div>
          <span className="text-gray-700 font-medium">
            {messages[type]}...
          </span>
        </div>
      </div>
    </div>
  );
}