import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOAuthCallback, type Platform } from '@/features/integrations';

export default function OAuthCallbackPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const oauthCallback = useOAuthCallback();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const platform = params.get('platform') as Platform;
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMessage(errorDescription || error || 'حدث خطأ أثناء الربط');
      return;
    }

    if (!code || !platform) {
      setStatus('error');
      setErrorMessage('معلومات التفويض غير مكتملة');
      return;
    }

    // Get the backend tunnel URL for the redirect URI
    const backendOAuthUrl = import.meta.env.VITE_BACKEND_OAUTH_URL || 'https://shaky-baths-tan.loca.lt';
    const redirectUri = `${backendOAuthUrl}/api/integrations/${platform.toLowerCase()}/callback`;

    // Call backend to exchange code for token (include state for PKCE verification)
    oauthCallback.mutate(
      {
        platform,
        data: {
          code,
          redirectUri,
          state: state || undefined,
        },
      },
      {
        onSuccess: () => {
          setStatus('success');
          // Redirect to settings after short delay
          setTimeout(() => {
            navigate('/settings');
          }, 2000);
        },
        onError: (err) => {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'فشل ربط الحساب');
        },
      }
    );
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {status === 'processing' && 'جاري ربط الحساب...'}
            {status === 'success' && 'تم ربط الحساب بنجاح!'}
            {status === 'error' && 'فشل ربط الحساب'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'processing' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                سيتم توجيهك للإعدادات...
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-sm text-muted-foreground text-center">
                {errorMessage}
              </p>
              <Button onClick={() => navigate('/settings')}>
                العودة للإعدادات
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
