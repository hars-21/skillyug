'use client';

import { Skeleton } from "./skeleton";

export function WelcomeScreenSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-4xl w-full mx-4">
        
        {/* Hero Section Skeleton */}
        <div className="text-center space-y-8">
          {/* Main Icon Skeleton */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <Skeleton className="w-full h-full rounded-2xl" />
            <div className="absolute -top-2 -right-2 w-8 h-8">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
          </div>

          {/* Title Skeleton */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-8 w-2/3 mx-auto" />
            </div>
            
            <div className="space-y-3 max-w-2xl mx-auto">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-5 w-4/5 mx-auto" />
              <Skeleton className="h-4 w-3/5 mx-auto" />
            </div>
          </div>

          {/* Features Grid Skeleton */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl p-4 border border-gray-200">
                <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-lg" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
          
          {/* CTA Button Skeleton */}
          <div className="space-y-4 pt-4">
            <Skeleton className="h-12 w-64 mx-auto rounded-xl" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestionScreenSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-w-5xl w-full">
        
        {/* Progress Section Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          {/* Progress Bar Skeleton */}
          <div className="relative">
            <Skeleton className="w-full h-2 rounded-full" />
            <div className="flex justify-between mt-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="w-2 h-2 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Question Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-48 mx-auto mb-6 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
        </div>

        {/* Options Skeleton */}
        <div className="space-y-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-6 rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}

export function ResultScreenSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-6xl w-full text-center">
        
        {/* Success Header Skeleton */}
        <div className="space-y-6 mb-10">
          {/* Success Animation Skeleton */}
          <div className="relative">
            <Skeleton className="w-20 h-20 mx-auto mb-4 rounded-2xl" />
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-6 h-6 rounded-sm" />
              ))}
            </div>
          </div>
          
          {/* Success Message Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3 mx-auto" />
            
            <div className="rounded-xl p-6 border border-gray-200">
              <Skeleton className="h-8 w-3/4 mx-auto mb-3" />
              <div className="space-y-2 max-w-3xl mx-auto">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5 mx-auto" />
              </div>
            </div>
            
            <Skeleton className="h-4 w-2/5 mx-auto" />
          </div>
        </div>

        {/* Learning Journey Skeleton */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Skeleton className="w-6 h-6 rounded-sm" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <Skeleton className="w-12 h-12 mx-auto mb-4 rounded-lg" />
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="mt-4 flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-2 h-2 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-14 w-64 mx-auto rounded-xl" />
          
          <div className="flex justify-center gap-4">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}