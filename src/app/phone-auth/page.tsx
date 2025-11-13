'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, setupRecaptcha, signInWithPhone, confirmOtp } from '@/firebase';
import type { ConfirmationResult } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

const phoneSchema = z.object({
  phone: z.string().refine(isValidPhoneNumber, { message: 'Invalid phone number.' }),
});
const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function PhoneAuthPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);
  
  // Setup reCAPTCHA on mount
  useEffect(() => {
    if (auth) {
        setupRecaptcha(auth, 'recaptcha-container', toast);
    }
  }, [auth, toast]);


  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onPhoneSubmit: SubmitHandler<PhoneFormValues> = async (data) => {
    if (!auth) return;
    setIsSendingOtp(true);
    try {
      const result = await signInWithPhone(auth, data.phone);
      setConfirmationResult(result);
      toast({
        title: 'OTP Sent',
        description: 'Check your phone for the verification code.',
      });
    } catch (error: any) {
        // Error is already handled inside signInWithPhone, but we can reset state here
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onOtpSubmit: SubmitHandler<OtpFormValues> = async (data) => {
    if (!confirmationResult) return;
    setIsVerifyingOtp(true);
    try {
      await confirmOtp(confirmationResult, data.otp);
      // Let the useUser hook redirect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'The OTP you entered is incorrect. Please try again.',
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center font-headline text-3xl font-extrabold text-gray-900">
            Sign in with your Phone
          </h2>
        </div>

        <Card>
          {!confirmationResult ? (
            // Step 1: Enter Phone Number
            <CardContent className="p-6">
                <CardDescription className="text-center mb-4">
                    We will send a one-time password (OTP) to your mobile number.
                </CardDescription>
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            international
                            defaultCountry="US"
                            placeholder="Enter phone number"
                            value={field.value}
                            onChange={field.onChange}
                            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={isSendingOtp}>
                    {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send OTP
                  </Button>
                </form>
              </Form>
            </CardContent>
          ) : (
            // Step 2: Enter OTP
            <CardContent className="p-6">
              <CardDescription className="text-center mb-4">
                Enter the 6-digit code sent to {phoneForm.getValues('phone')}.
              </CardDescription>
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            maxLength={6}
                            placeholder="••••••"
                            className="text-center text-2xl tracking-[0.5em] h-14"
                           />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={isVerifyingOtp}>
                    {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify OTP
                  </Button>
                  <Button variant="link" size="sm" className="w-full" onClick={() => setConfirmationResult(null)}>
                    Use a different number
                  </Button>
                </form>
              </Form>
            </CardContent>
          )}
        </Card>
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
