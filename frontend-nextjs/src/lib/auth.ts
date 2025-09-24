import NextAuth, { DefaultSession, User as NextAuthUser, Session as NextAuthSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import axios from 'axios';

// Define UserType enum to match the Prisma schema
export enum UserType {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN'
}

// Extend the default Session and User types from NextAuth
declare module "next-auth" {
  interface Session extends NextAuthSession {
    user: {
      id: string;
      userType: UserType;
      accessToken?: string;
      emailVerificationRequired?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends NextAuthUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: UserType;
    accessToken?: string;
    emailVerificationRequired?: boolean;
  }
}

// Validation schemas for NextAuth (simplified - backend handles full validation)
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // Just check it's not empty
});

const baseUserSchema = z.object({
  name: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters long'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  userType: z.enum(['student', 'instructor', 'admin'], {
    message: 'Please select a valid user type',
  })
});

export const signupSchema = baseUserSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Get API URL from environment - handle both client and server side
const getApiUrl = () => {
  // For server-side requests (inside Docker), use the internal service name
  if (typeof window === 'undefined') {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:5000';
    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  }
  
  // For client-side requests (browser), use the public URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validatedInput = loginSchema.parse({
            email: credentials?.email,
            password: credentials?.password,
          });

          // Call backend API for authentication (using login-check endpoint)
          const response = await axios.post(
            `${getApiUrl()}/auth/login`,
            validatedInput,
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000,
              validateStatus: (status) => status < 500, // Don't throw on 4xx errors
            }
          );

          if (response.status !== 200 && response.status !== 201) {
            console.error('Login failed:', response.data);
            
            // Check if the error is about email verification
            if (response.data?.message?.includes('verify your email') || 
                response.data?.message?.includes('not verified') ||
                response.data?.message?.includes('Email not confirmed') ||
                response.data?.message?.includes('Please verify your email')) {
              // Throw a specific error that NextAuth will forward
              throw new Error(`EMAIL_NOT_VERIFIED:${validatedInput.email}`);
            }
            
            // For other authentication errors, throw a generic error
            const errorMessage = response.data?.message || response.data?.error || 'Authentication failed';
            throw new Error(errorMessage);
          }

          const responseData = response.data;
          console.log('Backend response:', responseData); // Debug log

          // Handle the actual response structure from our backend
          if (!responseData || responseData.status !== 'success') {
            console.error('Invalid response status:', responseData);
            return null;
          }

          const userData = responseData.data;
          
          // Check if user needs verification
          if (userData.needsVerification) {
            // For unverified users, throw an error that the frontend can catch
            throw new Error(`EMAIL_NOT_VERIFIED:${validatedInput.email}`);
          }
          
          // For verified users, proceed with login
          // Check that we have the necessary user data and token
          if (!userData.user || !userData.user.id || !userData.token) {
            console.error('Invalid user data structure:', userData);
            return null;
          }

          // Return user object for NextAuth
          return {
            id: userData.user.id,
            name: userData.user.fullName || userData.user.name,
            email: userData.user.email,
            image: userData.user.image,
            userType: userData.user.userType,
            accessToken: userData.token,
            emailVerificationRequired: false,
          };
        } catch (error) {
          console.error("Authorization Error:", error);
          
          // Log specific error details for debugging
          if (axios.isAxiosError(error)) {
            console.error('Axios error:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });
            
            // Check if the error is about email verification
            if (error.response?.data?.message?.includes('verify your email') || 
                error.response?.data?.message?.includes('not verified') ||
                error.response?.data?.message?.includes('Email not confirmed') ||
                error.response?.data?.message?.includes('Please verify your email')) {
              // Throw a specific error that NextAuth will forward
              const email = credentials?.email || '';
              throw new Error(`EMAIL_NOT_VERIFIED:${email}`);
            }
            
            // For other errors, throw the specific error message
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
            throw new Error(errorMessage);
          }
          
          // Re-throw the error if it's already a custom error (like EMAIL_NOT_VERIFIED)
          if (error instanceof Error && error.message.startsWith('EMAIL_NOT_VERIFIED:')) {
            throw error;
          }
          
          // For any other errors, throw a generic message
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.sub = user.id;
        token.userType = user.userType as UserType;
        token.accessToken = user.accessToken;
        token.emailVerificationRequired = user.emailVerificationRequired;
        token.email = user.email;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub as string) || '';
        session.user.userType = token.userType as UserType;
        session.user.accessToken = token.accessToken as string;
        session.user.emailVerificationRequired = token.emailVerificationRequired as boolean;
        session.user.email = token.email as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle email verification redirect
      if (url.includes('verify-email')) {
        return url;
      }
      
      // Redirect to dashboard after successful login
      if (url.includes('/login') || url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

// Helper function to register new users
export async function registerUser(userData: unknown) {
  try {
    // Validate input data
    const baseValidation = baseUserSchema.safeParse(userData);
    if (!baseValidation.success) {
      throw new Error(`Validation error: ${baseValidation.error.issues.map(i => i.message).join(', ')}`);
    }

    const { name: fullName, email, password, userType } = baseValidation.data;
    
    // Map 'instructor' to 'MENTOR' for the backend
    const mappedUserType = userType === 'instructor' ? 'MENTOR' : userType.toUpperCase();

    const response = await axios.post(
      `${getApiUrl()}/auth/register`,
      { 
        fullName, 
        email, 
        password, 
        userType: mappedUserType 
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      const errorMessage = response.data?.message || response.data?.error || 'Registration failed';
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed';
      throw new Error(errorMessage);
    }
    
    throw error instanceof Error ? error : new Error('Registration failed');
  }
}

// Helper function to verify OTP
export async function verifyOtp(email: string, otp: string) {
  try {
    const response = await axios.post(
      `${getApiUrl()}/auth/verify-otp`,
      { email, otp },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      const errorMessage = response.data?.message || response.data?.error || 'OTP verification failed';
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error('OTP verification error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'OTP verification failed';
      throw new Error(errorMessage);
    }
    
    throw error instanceof Error ? error : new Error('OTP verification failed');
  }
}

// Helper function to resend OTP
export async function resendOtp(email: string) {
  try {
    const response = await axios.post(
      `${getApiUrl()}/auth/resend-otp`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      const errorMessage = response.data?.message || response.data?.error || 'Failed to resend OTP';
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to resend OTP';
      throw new Error(errorMessage);
    }
    
    throw error instanceof Error ? error : new Error('Failed to resend OTP');
  }
}

// Helper function to automatically send OTP for email verification
export async function sendVerificationOtp(email: string) {
  try {
    const response = await axios.post(
      `${getApiUrl()}/auth/resend-otp`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      const errorMessage = response.data?.message || response.data?.error || 'Failed to send verification code';
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error('Send verification OTP error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to send verification code';
      throw new Error(errorMessage);
    }
    
    throw error instanceof Error ? error : new Error('Failed to send verification code');
  }
}

// Helper function to get the current session with proper typing
export async function getServerSession() {
  return await auth();
}

// Type for session parameter in helper functions
type SessionType = {
  user?: {
    id?: string;
    userType?: UserType;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessToken?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  [key: string]: unknown;
} | null | undefined;

// Helper function to check if user is authenticated
export function isAuthenticated(session: SessionType): boolean {
  return !!(session?.user?.id);
}

// Helper function to check user role
export function hasRole(session: SessionType, role: UserType): boolean {
  return session?.user?.userType === role;
}

// Helper function to check if user is admin
export function isAdmin(session: SessionType): boolean {
  return hasRole(session, UserType.ADMIN);
}

// Helper function to check if user is mentor
export function isMentor(session: SessionType): boolean {
  return hasRole(session, UserType.MENTOR);
}

// Helper function to check if user is student
export function isStudent(session: SessionType): boolean {
  return hasRole(session, UserType.STUDENT);
}
