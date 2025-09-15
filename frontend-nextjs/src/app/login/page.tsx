'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/**
 * Production-ready login form with proper email validation
 * Security features:
 * - Proper input validation
 * - Rate limiting protection
 * - Error handling
 * - Loading states
 * - Accessibility support
 */

// Enhanced email-only validation schema
const loginFormSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginResponse {
  verified?: boolean;
  needsVerification?: boolean;
  email?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    fullName?: string;
  };
  message: string;
  rateLimitExceeded?: boolean;
  expiresIn?: number;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { 
      email: '', 
      password: '' 
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Handle verification success from URL params
  useEffect(() => {
    if (searchParams?.get('verified') === 'true') {
      toast.success('Account verified successfully! You can now log in.');
      const email = searchParams.get('email');
      if (email) {
        form.setValue('email', decodeURIComponent(email));
      }
    }
  }, [searchParams, form]);

  // Clear error when user starts typing
  useEffect(() => {
    const subscription = form.watch(() => {
      if (error) setError(null);
    });
    return () => subscription.unsubscribe();
  }, [form, error]);

  async function handleLoginSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Check credentials with the Express backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const checkResponse = await fetch(`${backendUrl}/api/auth/login-check`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json().catch(() => ({}));
        
        if (checkResponse.status === 429) {
          setError(errorData.error || 'Too many login attempts. Please try again later.');
          return;
        }
        
        setError(errorData.error || 'Invalid email or password');
        return;
      }

      const checkResponse_data = await checkResponse.json();
      
      // Extract the actual data from the standardized API response format
      const checkData: LoginResponse = checkResponse_data.data || checkResponse_data;

      // Step 2: Handle unverified users
      if (checkData.needsVerification) {
        toast(checkData.message, { duration: 5000 });
        router.push(`/verify-otp?email=${encodeURIComponent(checkData.email || values.email)}&resent=true`);
        return;
      }

      // Step 3: Handle verified users - proceed with NextAuth
      if (checkData.verified) {
        toast.success('Credentials verified. Logging you in...');
        
        const result = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          setError('Login failed. Please try again.');
          return;
        }

        if (result?.ok) {
          toast.success('Login successful!');
          
          // Redirect based on user role
          if (checkData.user?.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
          
          router.refresh();
        }
      }
    } catch (fetchError) {
      console.error('Login error:', fetchError);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          {/* Replace with your logo */}
          <div className="w-8 h-8 bg-blue-600 rounded"></div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your account to continue
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full h-11"
          disabled={isLoading}
          onClick={() => signIn('google')}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </Button>
        
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/register" 
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Create one here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
