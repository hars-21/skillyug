'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/AuthContext';

// Schema for password validation
const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export function ResetPasswordContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('No reset token found. The link may be invalid.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await resetPassword(token, data.password, data.confirmPassword);
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. The token may be invalid or expired.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || error) {
    return (
      <div className="text-center text-white">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-6 text-2xl font-bold">Invalid Link</h2>
        <p className="mt-2 text-gray-300">
          {error || 'The password reset link is invalid or has expired. Please request a new one.'}
        </p>
        <Link 
          href="/forgot-password" 
          className="mt-6 inline-block text-orange-500 hover:text-orange-400 font-medium"
        >
          Request a New Link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center text-white">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
        <h2 className="mt-6 text-2xl font-bold">Password Reset!</h2>
        <p className="mt-2 text-gray-300">
          Your password has been changed successfully.
        </p>
        <Link 
          href="/login" 
          className="mt-6 inline-block px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
        >
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Set a New Password</h2>
        <p className="text-gray-300 mt-2">Your new password must be at least 8 characters long.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-12 py-3 bg-blue-900/30 border ${
                errors.password ? 'border-red-500' : 'border-blue-800/50'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Enter new password"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        
        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-12 py-3 bg-blue-900/30 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-blue-800/50'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Confirm new password"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full py-3 rounded-lg font-semibold flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-600 transition-colors duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </>
  );
}
