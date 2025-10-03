'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { signupSchema } from '../../lib/auth'; // Import from auth.ts
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { z } from 'zod'; // Import z for type inference

// Infer the type from the Zod schema
type SignUpFormData = z.infer<typeof signupSchema>;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<SignUpFormData>({ // Use the inferred type here
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'student', // Provide a default userType
      agreeToTerms: false,
    }
  });

  const watchUserType = watch('userType');

  // --- THIS IS THE CORRECTED FUNCTION ---
  const onSubmit = async (formData: SignUpFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Validate the form data against the schema
      const result = signupSchema.safeParse(formData);
      
      if (!result.success) {
        // Handle validation errors
        const errorMessages = result.error.issues.map(issue => issue.message);
        errorMessages.forEach(message => {
          toast.error(message);
        });
        return;
      }
      
      // Extract the validated data
      const { email, password, name, userType } = result.data;
      
      // Call the signUp function with the required fields
      await signUp(email, password, name, userType);
      
      // Show success message and redirect to OTP verification
      toast.success('Account created successfully! Please check your email for verification code.');
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      // Handle API errors
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-gray-300 mt-2">Join our learning community</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('name')}
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 bg-blue-900/30 border ${
                      errors.name ? 'border-red-500' : 'border-blue-800/50'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name.message}
                  </p>
                )}
              </div>

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
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-12 py-3 bg-blue-900/30 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-blue-800/50'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start">
                  <input
                    {...register('agreeToTerms')}
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 bg-blue-900/30 border-blue-800/50 rounded focus:ring-orange-500 mt-1"
                  />
                  <span className="ml-3 text-sm text-gray-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-orange-500 hover:text-orange-400">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-orange-500 hover:text-orange-400">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.agreeToTerms.message}
                  </p>
                )}
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
