'use client'

import { createContext, useContext, useState } from 'react'
import { useSession, signIn as authSignIn, signOut as authSignOut } from 'next-auth/react'
import { registerUser, verifyOtp, resendOtp, UserType } from '../lib/auth'
import toast from 'react-hot-toast'
import axios from 'axios'

// Extend the User type to include userType
declare module 'next-auth' {
  interface User {
    userType?: UserType
  }
}

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  userType?: string;
  image?: string | null;
}

interface Profile {
  id?: string;
  full_name?: string | null;
  email?: string | null;
  user_type: string;
  email_verified: boolean;
}

interface Session {
  user?: User;
}

const AuthContext = createContext<{
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, userType: string) => Promise<void>
  signIn: (email: string, password: string, userType: string) => Promise<void>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ status: string; message: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ status: string; message: string }>
  updatePassword: (newPassword: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
  createProfileForCurrentUser: () => Promise<boolean>
  checkDatabaseSetup: () => Promise<boolean>
  testBackendConnection: () => Promise<any>
} | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const user = session?.user || null
  const profile = user ? {
    id: user.id,
    full_name: user.name,
    email: user.email,
    user_type: user.userType || 'student',
    email_verified: true
  } : null

  const signUp = async (email: string, password: string, fullName: string, userType: string) => {
    try {
      setLoading(true)
      
      // Register user in our mock database
      await registerUser({
        name: fullName,
        email,
        password,
        userType: userType as 'student' | 'instructor' | 'admin'
      })

      toast.success('Account created successfully! You can now sign in.')
    } catch (error: unknown) {
      console.error('Signup error:', error)
      toast.error((error as Error).message || 'Failed to create account')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string, userType: string) => {
    try {
      setLoading(true)

      const result = await authSignIn('credentials', {
        email,
        password,
        userType,
        redirect: false
      })

      console.log('SignIn result:', result); // Debug log

      if (result?.error) {
        console.log('SignIn error detected:', result.error); // Debug log
        
        // Handle specific error types without showing generic toast
        if (result.error.includes('EMAIL_NOT_VERIFIED:')) {
          const userEmail = result.error.split(':')[1] || email;
          throw new Error(`EMAIL_NOT_VERIFIED:${userEmail}`);
        }
        
        if (result.error.includes('verify your email') || 
            result.error.includes('not verified') ||
            result.error.includes('Please verify your email')) {
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
        }
        
        if (result.error.includes('CallbackRouteError')) {
          // Extract the underlying error if possible
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
        }
        
        if (result.error.includes('AUTH_RATE_LIMIT_EXCEEDED')) {
          throw new Error('Too many login attempts. Please try again in 15 minutes.');
        }
        
        // Generic authentication error
        throw new Error('Invalid email or password');
      }

      // Successful login
      if (!result?.error) {
        toast.success('Welcome back!')
        return;
      }

    } catch (error: unknown) {
      console.error('Sign in error:', error)
      const errorMessage = (error as Error).message || 'Failed to sign in';
      
      // Re-throw specific errors without showing toast (let caller handle)
      if (errorMessage.startsWith('EMAIL_NOT_VERIFIED:') || 
          errorMessage.includes('Too many login attempts')) {
        throw new Error(errorMessage);
      }
      
      // Show toast for generic errors and re-throw
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await authSignOut({ redirect: false })
      toast.success('Signed out successfully')
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to sign out')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      console.log('Sending forgot password request for email:', email);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const fullUrl = `${backendUrl}/api/auth/forgot-password`;
      console.log('Making request to URL:', fullUrl);
      console.log('Backend URL from env:', process.env.NEXT_PUBLIC_BACKEND_URL);
      
      const response = await axios.post(
        fullUrl, 
        { email },
        { 
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Forgot password response:', response.data);
      // Show success message from the server or a default one
      toast.success(response.data.message || 'If an account exists with this email, a reset link has been sent.');
      return response.data;
    } catch (error: any) {
      console.error('Raw error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
      
      // More comprehensive error logging
      const errorDetails = {
        message: error.message || 'Unknown error',
        name: error.name || 'Unknown',
        code: error.code || 'No code',
        stack: error.stack ? error.stack.substring(0, 500) : 'No stack trace',
        ...(error.response && {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        }),
        ...(error.request && {
          request: {
            url: error.request.responseURL || error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout
          }
        }),
        isAxiosError: error.isAxiosError,
        isNetworkError: !error.response && error.request
      };
      
      console.error('Forgot password error details:', errorDetails);
      
      let errorMessage = 'Failed to process your request';
      
      if (!error.response && error.request) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused. Backend server may not be running.';
      } else if (error.code === 'TIMEOUT') {
        errorMessage = 'Request timeout. Server may be overloaded.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.patch(
        `${backendUrl}/api/auth/reset-password/${token}`,
        { password, confirmPassword },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      toast.success(response.data.message || 'Password has been reset successfully');
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const updatePassword = async (_newPassword: string) => {
    // Mock implementation - in production, implement actual password update
    toast.success('Password updated successfully (mock implementation)')
  }

  const resendVerification = async (_email: string) => {
    // Mock implementation - in production, implement actual email verification
    toast.success('Verification email sent (mock implementation)')
  }

  const createProfileForCurrentUser = async () => {
    // With Auth.js, profile is automatically created from session
    return true
  }

  const checkDatabaseSetup = async () => {
    // Mock implementation - always return true for now
    return true
  }

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backendUrl}/api/test`, {
        timeout: 5000
      });
      
      console.log('Backend test response:', response.data);
      toast.success(`Backend connection successful! ${response.data.message}`);
      return response.data;
    } catch (error: any) {
      console.error('Backend test error:', error);
      let errorMessage = 'Backend connection failed';
      
      if (!error.response && error.request) {
        errorMessage = 'Cannot reach backend server. Is it running?';
      } else if (error.response) {
        errorMessage = `Backend responded with ${error.response.status}`;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (email: string, otp: string) => {
    try {
      setLoading(true)
      await verifyOtp(email, otp)
      toast.success('Email verified successfully!')
    } catch (error: unknown) {
      console.error('OTP verification error:', error)
      toast.error((error as Error).message || 'Failed to verify OTP')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async (email: string) => {
    try {
      setLoading(true)
      await resendOtp(email)
      toast.success('OTP sent successfully! Please check your email.')
    } catch (error: unknown) {
      console.error('Resend OTP error:', error)
      toast.error((error as Error).message || 'Failed to resend OTP')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading: status === 'loading' || loading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    updatePassword,
    resendVerification,
    verifyOtp: handleVerifyOtp,
    resendOtp: handleResendOtp,
    createProfileForCurrentUser,
    checkDatabaseSetup,
    testBackendConnection,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
