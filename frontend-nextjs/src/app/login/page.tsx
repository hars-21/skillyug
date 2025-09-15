'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { loginSchema } from '../../lib/validation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { logger, AuthError, AuthErrorType } from '../../lib/logger';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  
  const { signIn, resendVerification, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
    
    // Check if user was redirected after verification
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
      // Clean up the URL
      window.history.replaceState({}, '', '/login');
    }
  }, [user, loading, router]);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { rememberMe: false }
  });

  const watchUserType = watch('userType');

  const onSubmit = async (data: { email: string; password: string; userType: "student" | "instructor" | "admin"; rememberMe?: boolean }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      logger.info('Login attempt started', { email: data.email, userType: data.userType });
      
      // Use the AuthContext signIn method
      await signIn(data.email, data.password, data.userType);
      
      // Success! Redirect to dashboard
      logger.info('Login successful, redirecting to dashboard');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || '';
      logger.error('Login failed', { error: errorMessage, email: data.email });
      
      // Handle email verification errors
      if (errorMessage.startsWith('EMAIL_NOT_VERIFIED:')) {
        const userEmail = errorMessage.split(':')[1] || data.email;
        toast.error('Please verify your email before logging in.');
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
        }, 1000);
        return;
      }
      
      // Handle rate limiting
      if (errorMessage.includes('Too many login attempts')) {
        toast.error('Too many login attempts. Please try again in 15 minutes.');
        return;
      }
      
      // Handle other verification-related errors
      if (errorMessage.includes('Email not confirmed') || 
          errorMessage.includes('not verified') ||
          errorMessage.includes('Please verify your email')) {
        toast.error('Please verify your email before logging in.');
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        }, 1000);
        return;
      }
      
      // Generic error handling - AuthContext already shows toast for auth errors
      logger.error('Authentication failed with unknown error', errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const email = getValues('email');
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    setResendingVerification(true);
    try {
      await resendVerification(email);
      toast.success('Verification email sent!');
    } catch {
      toast.error('Failed to resend verification email.');
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-black/30 backdrop-blur-md border border-blue-800/30 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
                <BookOpen className="h-10 w-10 text-orange-500" />
                <span className="text-3xl font-bold text-white">Skillyug</span>
              </Link>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-300 mt-2">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 bg-blue-900/30 border ${
                      errors.email ? 'border-red-500' : 'border-blue-800/50'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">I am a:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['student', 'instructor', 'admin'].map((type) => (
                    <label key={type} className="relative cursor-pointer">
                      <input {...register('userType')} type="radio" value={type} className="sr-only" />
                      <div
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 text-center border ${
                          watchUserType === type
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-blue-900/50 text-gray-300 border-blue-800/50 hover:bg-blue-800/50'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.userType && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.userType.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 bg-blue-900/30 border ${
                      errors.password ? 'border-red-500' : 'border-blue-800/50'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 bg-blue-900/30 border-blue-800/50 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-400">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform ${
                  isValid && !isSubmitting
                    ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Resend Verification */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="text-sm text-gray-400 hover:text-gray-300 flex items-center justify-center space-x-2 mx-auto"
                >
                  {resendingVerification ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Resend verification email</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="text-orange-500 hover:text-orange-400 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
