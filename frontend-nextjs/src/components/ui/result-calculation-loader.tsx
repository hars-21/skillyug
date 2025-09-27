'use client';

import { useState, useEffect } from 'react';
import { Bot, Zap, Sparkles, Target, CheckCircle } from 'lucide-react';

interface CalculationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  duration: number;
}

interface ResultCalculationLoaderProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function ResultCalculationLoader({ isVisible, onComplete }: ResultCalculationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: CalculationStep[] = [
    {
      id: 'analyzing',
      label: 'Analyzing your preferences',
      icon: <Bot className="w-5 h-5" />,
      duration: 800
    },
    {
      id: 'matching',
      label: 'Finding perfect matches',
      icon: <Target className="w-5 h-5" />,
      duration: 1000
    },
    {
      id: 'personalizing',
      label: 'Personalizing recommendations',
      icon: <Sparkles className="w-5 h-5" />,
      duration: 700
    },
    {
      id: 'generating',
      label: 'Generating your learning path',
      icon: <Zap className="w-5 h-5" />,
      duration: 900
    }
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
      return;
    }

    let timeouts: NodeJS.Timeout[] = [];
    let totalDelay = 0;

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);
        
        const completeTimeout = setTimeout(() => {
          setCompletedSteps(prev => new Set([...prev, step.id]));
          
          if (index === steps.length - 1) {
            setTimeout(() => {
              onComplete();
            }, 500);
          }
        }, step.duration);
        
        timeouts.push(completeTimeout);
      }, totalDelay);
      
      timeouts.push(timeout);
      totalDelay += step.duration;
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#051C7F]/20 to-[#EB8216]/20 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#051C7F] to-[#EB8216] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            AI Analysis in Progress
          </h3>
          <p className="text-gray-600">
            Creating your personalized learning journey...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSteps.has(step.id);
            const isPending = currentStep < index;

            return (
              <div 
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                  isActive ? 'bg-gradient-to-r from-[#051C7F]/10 to-[#EB8216]/10 border border-[#051C7F]/20' :
                  isCompleted ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-gradient-to-r from-[#051C7F] to-[#EB8216] text-white animate-pulse' :
                  'bg-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.icon}
                </div>
                
                <div className="flex-1">
                  <p className={`font-medium transition-colors duration-500 ${
                    isCompleted ? 'text-green-700' :
                    isActive ? 'text-[#051C7F]' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>

                {isActive && (
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-[#EB8216] rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#051C7F] to-[#EB8216] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}