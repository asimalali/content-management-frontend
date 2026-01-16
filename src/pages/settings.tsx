import { useState } from 'react';
import { Link } from 'wouter';
import { User, Link2, CreditCard, Loader2, RefreshCcw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/features/auth';
import { useCreditBalance } from '@/features/credits';
import {
  useConnectedAccounts,
  useDisconnectAccount,
  useConnectPlatform,
  type Platform,
  type ConnectedAccount,
} from '@/features/integrations';
import { toast } from 'sonner';

// Platform display info
const platformInfo: Record<Platform, { name: string; icon: string }> = {
  X: { name: 'X (تويتر)', icon: '𝕏' },
  Facebook: { name: 'فيسبوك', icon: 'f' },
  Instagram: { name: 'انستقرام', icon: '📷' },
  TikTok: { name: 'تيك توك', icon: '♪' },
};

const statusColors: Record<string, string> = {
  Connected: 'bg-green-100 text-green-800',
  Expired: 'bg-yellow-100 text-yellow-800',
  Revoked: 'bg-red-100 text-red-800',
  Error: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  Connected: 'متصل',
  Expired: 'منتهي الصلاحية',
  Revoked: 'ملغى',
  Error: 'خطأ',
};

function ConnectedAccountCard({
  account,
  onDisconnect,
  isDisconnecting,
}: {
  account: ConnectedAccount;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}) {
  const platform = platformInfo[account.platform];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
      <div className="flex items-center gap-3">
        {account.profileImageUrl ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={account.profileImageUrl} alt={account.displayName} />
            <AvatarFallback>{platform?.icon}</AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-lg w-10 h-10 flex items-center justify-center bg-background rounded-full">
            {platform?.icon}
          </span>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{account.displayName || platform?.name}</p>
            <Badge
              variant="secondary"
              className={statusColors[account.status]}
            >
              {statusLabels[account.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">@{account.platformUsername}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onDisconnect}
        disabled={isDisconnecting}
      >
        {isDisconnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'إلغاء الربط'
        )}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [disconnectId, setDisconnectId] = useState<string | null>(null);

  // Fetch data from APIs
  const { data: connectedAccounts, isLoading: isLoadingAccounts, refetch: refetchAccounts } = useConnectedAccounts();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();

  // Mutations
  const disconnectAccount = useDisconnectAccount();
  const connectPlatform = useConnectPlatform();

  const handleConnect = async (platform: Platform) => {
    // Use the HTTPS tunnel URL for OAuth callback (Facebook requires HTTPS)
    // This should match what's configured in Facebook App settings
    const backendOAuthUrl = import.meta.env.VITE_BACKEND_OAUTH_URL || 'https://shaky-baths-tan.loca.lt';
    const redirectUri = `${backendOAuthUrl}/api/integrations/${platform.toLowerCase()}/callback`;

    connectPlatform.mutate(
      {
        platform,
        data: { redirectUri },
      },
      {
        onSuccess: (response) => {
          // Redirect to OAuth authorization URL
          window.location.href = response.authorizationUrl;
        },
        onError: () => {
          toast.error(`فشل الاتصال بـ ${platformInfo[platform]?.name}`);
        },
      }
    );
  };

  const handleDisconnect = () => {
    if (!disconnectId) return;

    disconnectAccount.mutate(disconnectId, {
      onSuccess: () => {
        toast.success('تم إلغاء الربط بنجاح');
        setDisconnectId(null);
      },
      onError: () => {
        toast.error('فشل إلغاء الربط');
        setDisconnectId(null);
      },
    });
  };

  // Get platforms that are not connected yet
  const connectedPlatforms = new Set(connectedAccounts?.map(a => a.platform) || []);
  const availablePlatforms = (['X', 'Facebook', 'Instagram', 'TikTok'] as Platform[]).filter(
    p => !connectedPlatforms.has(p)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">
          إدارة حسابك وإعدادات التطبيق
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              الملف الشخصي
            </CardTitle>
            <CardDescription>
              معلومات حسابك الأساسية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'م'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user?.fullName || 'مستخدم'}</h3>
                <p className="text-sm text-muted-foreground" dir="ltr">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">حالة الحساب</span>
                <Badge variant="outline" className="text-green-600">
                  نشط
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ الانضمام</span>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Accounts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  الحسابات المرتبطة
                </CardTitle>
                <CardDescription>
                  ربط حسابات وسائل التواصل الاجتماعي للنشر المباشر
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetchAccounts()}
                disabled={isLoadingAccounts}
              >
                <RefreshCcw className={`h-4 w-4 ${isLoadingAccounts ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingAccounts ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : connectedAccounts && connectedAccounts.length > 0 ? (
              <div className="space-y-2">
                {connectedAccounts.map((account) => (
                  <ConnectedAccountCard
                    key={account.id}
                    account={account}
                    onDisconnect={() => setDisconnectId(account.id)}
                    isDisconnecting={disconnectAccount.isPending && disconnectId === account.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  لم يتم ربط أي حسابات بعد
                </p>
              </div>
            )}

            {availablePlatforms.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">ربط حساب جديد</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePlatforms.map((platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        onClick={() => handleConnect(platform)}
                        className="justify-start"
                        disabled={connectPlatform.isPending}
                      >
                        {connectPlatform.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                          <span className="ml-2">{platformInfo[platform]?.icon}</span>
                        )}
                        {platformInfo[platform]?.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              الاشتراك
            </CardTitle>
            <CardDescription>
              معلومات باقتك الحالية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div>
                <p className="font-semibold">الباقة المجانية</p>
                <p className="text-sm text-muted-foreground">50 وحدة محتوى شهرياً</p>
              </div>
              <Badge>الباقة الحالية</Badge>
            </div>

            {isLoadingCredits ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : creditBalance ? (
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الرصيد المتبقي</span>
                  <span className="font-medium">{creditBalance.available} وحدة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الوحدات المستخدمة</span>
                  <span className="font-medium">{creditBalance.used || 0} وحدة</span>
                </div>
              </div>
            ) : null}

            <Button asChild className="w-full">
              <Link href="/plans">ترقية الباقة</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من إلغاء الربط؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إلغاء ربط هذا الحساب ولن تتمكن من النشر عليه مباشرة. يمكنك إعادة ربطه لاحقاً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectAccount.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={disconnectAccount.isPending}
            >
              {disconnectAccount.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              إلغاء الربط
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
