'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyOtp, resendOtp } from '@/lib/auth';

// Schema for OTP validation
const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

type OTPFormData = z.infer<typeof otpSchema>;

export function VerifyOtpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: {
      otp: ''
    }
  });

  const otpValue = watch('otp');

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('No email provided for verification');
      router.push('/sign-up');
    }
  }, [email, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = useCallback(async (data: OTPFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await verifyOtp(email, data.otp);
      setIsVerified(true);
      toast.success('Email verified successfully!');
      
      // Redirect to login page after verification
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } catch (error: unknown) {
      console.error('OTP verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      toast.error(errorMessage);
      setValue('otp', ''); // Clear OTP field on error
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, email, router, setValue]);

  const handleResendOTP = async () => {
    if (isResending || countdown > 0) return;
    setIsResending(true);
    
    try {
      await resendOtp(email);
      toast.success('OTP sent successfully! Please check your email.');
      setCountdown(60); // 60 second countdown
    } catch (error: unknown) {
      console.error('Resend OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otpValue && otpValue.length === 6 && /^\d{6}$/.test(otpValue)) {
      handleSubmit(onSubmit)();
    }
  }, [otpValue, handleSubmit, onSubmit]);

  // Handle individual digit input for better UX
  const handleOTPChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setValue('otp', numericValue);
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-center mb-2">Email Verified!</CardTitle>
          <CardDescription className="text-center mb-6">
            Your email has been successfully verified. You can now sign in to your account.
          </CardDescription>
          <Link href="/login" className="w-full">
            <Button className="w-full">Continue to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We&apos;ve sent a 6-digit verification code to<br />
          <span className="font-medium text-primary">{email}</span>
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-center block">
              Enter Verification Code
            </label>
            <Input
              {...register('otp')}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              onChange={(e) => handleOTPChange(e.target.value)}
              className="text-center text-2xl font-mono tracking-widest"
              disabled={isSubmitting}
            />
            {errors.otp && (
              <p className="text-sm text-destructive flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.otp.message}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the code?
            </p>
            <Button
              type="button"
              variant="link"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className="p-0 h-auto"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
          
          <Link href="/sign-up" className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registration
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
