'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, Loader2, RefreshCw, LogIn } from 'lucide-react';
import { resendOtp } from '@/lib/auth';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams?.get('email') || '';
    setEmail(emailParam);
    
    if (!emailParam) {
      // If no email provided, redirect to login
      router.push('/login');
    }
  }, [searchParams, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (isResending || countdown > 0 || !email) return;
    
    setIsResending(true);
    try {
      await resendOtp(email);
      toast.success('Verification email sent! Please check your inbox.');
      setCountdown(60); // 60 second countdown
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToVerification = () => {
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Email Verification Required</h2>
              <p className="text-gray-300 mt-2">
                Please verify your email address before logging in
              </p>
            </div>

            {/* Email Display */}
            {email && (
              <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-300">Verification email sent to:</p>
                    <p className="text-white font-medium">{email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Information */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Account Created Successfully</p>
                  <p className="text-gray-300 text-sm">Your account has been created but needs email verification.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Check Your Email</p>
                  <p className="text-gray-300 text-sm">We've sent a 6-digit verification code to your email address.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Go to Verification */}
              <button
                onClick={handleGoToVerification}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Mail className="h-5 w-5" />
                <span>Enter Verification Code</span>
              </button>

              {/* Resend Verification */}
              <button
                onClick={handleResendVerification}
                disabled={isResending || countdown > 0}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isResending || countdown > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Resend in {countdown}s</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>

              {/* Try Login Again */}
              <Link
                href="/login"
                className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <LogIn className="h-5 w-5" />
                <span>Try Login Again</span>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center space-y-4">
              <div className="border-t border-blue-800/30 pt-6">
                <p className="text-gray-400 text-sm mb-4">
                  Having trouble? Check your spam folder or contact support.
                </p>
                
                <Link 
                  href="/sign-up" 
                  className="inline-flex items-center text-gray-400 hover:text-gray-300 text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Registration
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
