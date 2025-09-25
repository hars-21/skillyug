'use client'

import { createContext, useContext, useState } from 'react'
import { useSession, signIn as authSignIn, signOut as authSignOut } from 'next-auth/react'
import { registerUser, verifyOtp, resendOtp, UserType } from '../lib/auth'
import toast from 'react-hot-toast'
import axios, { AxiosError } from 'axios'

// Extend the User type to include userType and id
declare module 'next-auth' {
  interface User {
    id?: string
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
  testBackendConnection: () => Promise<unknown>
} | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * AuthProvider component that provides authentication context and functionality to the entire application.
 * 
 * This component wraps the application with authentication state management, handling user sessions,
 * sign-in/sign-up operations, password management, email verification, and backend connectivity.
 * It integrates with NextAuth.js for session management and provides a unified interface for
 * authentication operations across the application.
 * 
 * @component
 * @param props - The component props
 * @param props.children - React nodes to be wrapped with the authentication context
 * 
 * @example
 * ```tsx
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 * 
 * @features
 * - **Session Management**: Integrates with NextAuth.js for automatic session handling
 * - **User Registration**: Complete sign-up flow with user type selection
 * - **Authentication**: Sign-in with comprehensive error handling and email verification
 * - **Password Management**: Forgot/reset password functionality with token-based verification
 * - **Email Verification**: OTP-based email verification system with resend capability
 * - **Error Handling**: Detailed error categorization and user-friendly messaging
 * - **Loading States**: Centralized loading state management for all auth operations
 * - **Backend Integration**: Full backend connectivity testing and error reporting
 * 
 * @context Provides the following authentication state and methods:
 * - `user`: Current authenticated user object or null
 * - `profile`: Normalized user profile with consistent structure
 * - `session`: NextAuth session object
 * - `loading`: Combined loading state from NextAuth and internal operations
 * - `signUp`: User registration with email, password, full name, and user type
 * - `signIn`: Authentication with comprehensive error handling for various scenarios
 * - `signOut`: Sign out functionality with cleanup
 * - `forgotPassword`: Password reset request with email notification
 * - `resetPassword`: Password reset completion with token validation
 * - `updatePassword`: Password update for authenticated users (mock implementation)
 * - `resendVerification`: Email verification resend (mock implementation)
 * - `verifyOtp`: OTP verification for email confirmation
 * - `resendOtp`: OTP resend functionality
 * - `createProfileForCurrentUser`: Profile creation helper
 * - `checkDatabaseSetup`: Database connectivity verification
 * - `testBackendConnection`: Backend server health check
 * 
 * @errorHandling
 * The component provides sophisticated error handling for various scenarios:
 * - **Email Verification Errors**: Detects and handles unverified email addresses
 * - **Rate Limiting**: Manages too many login attempts with appropriate messaging
 * - **Network Errors**: Handles connection issues with the backend server
 * - **Authentication Failures**: Processes various NextAuth error types
 * - **Server Errors**: Comprehensive error reporting with status codes and messages
 * 
 * @dependencies
 * - NextAuth.js for session management
 * - Axios for HTTP requests to the backend
 * - Toast notifications for user feedback
 * - Custom authentication utilities (registerUser, verifyOtp, etc.)
 * 
 * @returns JSX.Element - AuthContext.Provider wrapping the children components
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const user = session?.user || null
  const profile = user ? {
    id: (user as User).id,
    full_name: user.name,
    email: user.email,
    user_type: (user as User).userType || 'student',
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
        console.log('Full result object:', JSON.stringify(result, null, 2)); // Debug log
        
        // Handle CallbackRouteError which wraps our custom errors
        if (result.error.includes('CallbackRouteError')) {
          // Extract the underlying error from the NextAuth logs or assume email verification issue
          console.log('CallbackRouteError detected - likely email verification issue');
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
        }
        
        // Handle specific error types
        if (result.error.includes('EMAIL_NOT_VERIFIED:')) {
          const userEmail = result.error.split(':')[1] || email;
          throw new Error(`EMAIL_NOT_VERIFIED:${userEmail}`);
        }
        
        // Handle other specific error patterns
        if (result.error.includes('verify your email') || 
            result.error.includes('not verified') ||
            result.error.includes('Please verify your email')) {
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
        }
        
        if (result.error.includes('Too many login attempts')) {
          throw new Error('Too many login attempts. Please try again in 15 minutes.');
        }
        
        // For CredentialsSignin errors, check if it's email verification
        if (result.error.includes('CredentialsSignin')) {
          // Most CredentialsSignin errors with our setup are email verification issues
          console.log('CredentialsSignin detected - checking if email verification related');
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
        }
        
        // Generic authentication error
        throw new Error(result.error || 'Invalid email or password');
      }

      // Check if login failed but no specific error was returned
      if (!result?.ok) {
        console.log('Login failed - result not ok:', result);
        
        // If there's no error but login failed, it's likely an email verification issue
        // based on our backend logic
        if (!result?.error) {
          console.log('No specific error, likely email verification issue');
          throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
        }
      }

      // Successful login
      if (result?.ok) {
        toast.success('Welcome back!')
        return;
      }

    } catch (error: unknown) {
      console.error('Sign in error in AuthContext:', error)
      console.log('Error type:', typeof error, 'Error constructor:', error?.constructor?.name)
      const errorMessage = (error as Error).message || 'Failed to sign in';
      
      // Re-throw specific errors without showing toast (let caller handle)
      if (errorMessage.startsWith('EMAIL_NOT_VERIFIED:') || 
          errorMessage.includes('Too many login attempts')) {
        console.log('Re-throwing specific error:', errorMessage)
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
    } catch (error: unknown) {
      console.error('Raw error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error && typeof error === 'object' && 'constructor' in error ? error.constructor.name : 'Unknown');
      
      // More comprehensive error logging
      const axiosError = error as AxiosError;
      const errorDetails = {
        message: axiosError?.message || 'Unknown error',
        name: axiosError?.name || 'Unknown',
        code: axiosError?.code || 'No code',
        stack: axiosError?.stack ? axiosError.stack.substring(0, 500) : 'No stack trace',
        ...(axiosError?.response && {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        }),
        ...(axiosError?.request && {
          request: {
            url: axiosError.request.responseURL || axiosError.config?.url,
            method: axiosError.config?.method,
            timeout: axiosError.config?.timeout
          }
        }),
        isAxiosError: axiosError?.isAxiosError,
        isNetworkError: !axiosError?.response && axiosError?.request
      };
      
      console.error('Forgot password error details:', errorDetails);
      
      let errorMessage = 'Failed to process your request';
      
      if (!axiosError?.response && axiosError?.request) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
      } else if (axiosError?.response) {
        errorMessage = (axiosError.response.data as { message?: string })?.message || `Server error: ${axiosError.response.status}`;
      } else if (axiosError?.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused. Backend server may not be running.';
      } else if (axiosError?.code === 'TIMEOUT') {
        errorMessage = 'Request timeout. Server may be overloaded.';
      } else {
        errorMessage = axiosError?.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<{ status: string; message: string }> => {
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
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as { message?: string })?.message || axiosError.message || 'Failed to reset password';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (_newPassword: string) => {
    // Mock implementation - in production, implement actual password update
    console.log('Updating password for user:', _newPassword ? 'password provided' : 'no password')
    toast.success('Password updated successfully (mock implementation)')
  }

  const resendVerification = async (_email: string) => {
    // Mock implementation - in production, implement actual email verification
    console.log('Resending verification for email:', _email)
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
      await axios.get(`${backendUrl}/api/test`, {
        timeout: 5000
      });
    } catch (error: unknown) {
      console.error('Backend test error:', error);
      const axiosError = error as AxiosError;
      let errorMessage = 'Backend connection failed';
      
      if (!axiosError.response && axiosError.request) {
        errorMessage = 'Cannot reach backend server. Is it running?';
      } else if (axiosError.response) {
        errorMessage = `Backend responded with ${axiosError.response.status}`;
      }
      
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    }

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