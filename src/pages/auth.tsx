import { useState } from 'react';
import { Redirect } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/features/auth';
import { getErrorMessage } from '@/lib/api';
import { ThemeToggle } from '@/components/theme-toggle';
import { BrandName } from '@/components/brand-name';

const emailSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

const otpSchema = z.object({
  code: z.string().length(6, 'الرمز يجب أن يكون 6 أرقام'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const {
    pendingUserId,
    pendingEmail,
    register,
    isRegistering,
    registerError,
    login,
    isLoggingIn,
    loginError,
    verifyOtp,
    isVerifyingOtp,
    verifyOtpError,
    resendOtp,
    isResendingOtp,
    clearPendingAuth,
    isAuthenticated,
  } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  // Show OTP verification if we have a pending user
  if (pendingUserId) {
    return (
      <OtpVerification
        email={pendingEmail || ''}
        userId={pendingUserId}
        onVerify={verifyOtp}
        isVerifying={isVerifyingOtp}
        error={verifyOtpError}
        onResend={() => resendOtp({ userId: pendingUserId })}
        isResending={isResendingOtp}
        onBack={clearPendingAuth}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <BrandName variant="short" />
          </CardTitle>
          <CardDescription>
            أنشئ محتوى احترافي بالذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <EmailForm
                onSubmit={(data) => login({ email: data.email })}
                isSubmitting={isLoggingIn}
                error={loginError}
                submitLabel="تسجيل الدخول"
              />
            </TabsContent>

            <TabsContent value="register">
              <EmailForm
                onSubmit={(data) => register({ email: data.email })}
                isSubmitting={isRegistering}
                error={registerError}
                submitLabel="إنشاء حساب"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface EmailFormProps {
  onSubmit: (data: EmailFormData) => void;
  isSubmitting: boolean;
  error: Error | null;
  submitLabel: string;
}

function EmailForm({ onSubmit, isSubmitting, error, submitLabel }: EmailFormProps) {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}

interface OtpVerificationProps {
  email: string;
  userId: string;
  onVerify: (data: { userId: string; code: string }) => void;
  isVerifying: boolean;
  error: Error | null;
  onResend: () => void;
  isResending: boolean;
  onBack: () => void;
}

function OtpVerification({
  email,
  userId,
  onVerify,
  isVerifying,
  error,
  onResend,
  isResending,
  onBack,
}: OtpVerificationProps) {
  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const handleSubmit = (data: OtpFormData) => {
    onVerify({ userId, code: data.code });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">تأكيد البريد الإلكتروني</CardTitle>
          <CardDescription>
            أدخل الرمز المرسل إلى
            <br />
            <span className="font-medium text-foreground" dir="ltr">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        dir="ltr"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive text-center">
                  {getErrorMessage(error)}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تأكيد
              </Button>

              <div className="flex flex-col gap-2 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onResend}
                  disabled={isResending}
                >
                  {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onBack}
                >
                  تغيير البريد الإلكتروني
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
