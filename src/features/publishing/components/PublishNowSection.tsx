import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Send, Loader2, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useConnectedAccounts, type ConnectedAccount, type Destination } from '@/features/integrations';
import { usePublishInstant, type PublishResult, type PublishDestination } from '@/features/publishing';
import { DestinationSelector, type SelectedDestination, platformIcons } from './DestinationSelector';
import { toast } from 'sonner';

// V1 supported platforms only
const V1_PLATFORMS = ['X', 'Instagram'];

interface PublishNowSectionProps {
  projectId: string;
  initialContent: string;
  contentItemId?: string;
  onPublishSuccess?: (result: PublishResult) => void;
}

export function PublishNowSection({
  projectId,
  initialContent,
  contentItemId,
  onPublishSuccess,
}: PublishNowSectionProps) {
  const [postText, setPostText] = useState(initialContent);
  const [selectedDestinations, setSelectedDestinations] = useState<SelectedDestination[]>([]);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  // Sync postText when initialContent changes (new generation)
  useEffect(() => {
    setPostText(initialContent);
    setPublishResult(null);
    setSelectedDestinations([]);
  }, [initialContent]);

  const { data: connectedAccounts, isLoading: isLoadingAccounts } = useConnectedAccounts();
  const publishInstant = usePublishInstant();

  // Filter for V1 platforms and connected status only
  const activeAccounts = connectedAccounts?.filter(
    a => a.status === 'Connected' && V1_PLATFORMS.includes(a.platform)
  ) || [];

  const hasNoAccounts = !isLoadingAccounts && activeAccounts.length === 0;

  // Toggle destination selection
  const toggleDestination = (account: ConnectedAccount, destination: Destination) => {
    const exists = selectedDestinations.find(
      d => d.accountId === account.id && d.destinationId === destination.destinationId
    );

    if (exists) {
      setSelectedDestinations(
        selectedDestinations.filter(
          d => !(d.accountId === account.id && d.destinationId === destination.destinationId)
        )
      );
    } else {
      setSelectedDestinations([
        ...selectedDestinations,
        {
          accountId: account.id,
          destinationId: destination.destinationId,
          accountName: account.displayName || account.platformUsername,
          platform: account.platform,
        },
      ]);
    }
  };

  // Handle publish
  const handlePublish = () => {
    if (!postText.trim()) {
      toast.error('يرجى كتابة نص المنشور');
      return;
    }
    if (selectedDestinations.length === 0) {
      toast.error('يرجى اختيار وجهة واحدة على الأقل للنشر');
      return;
    }

    const destinations: PublishDestination[] = selectedDestinations.map(d => ({
      connectedAccountId: d.accountId,
      destinationId: d.destinationId,
    }));

    publishInstant.mutate(
      {
        projectId,
        contentItemId: contentItemId || undefined,
        postText,
        destinations,
      },
      {
        onSuccess: (result) => {
          setPublishResult(result);
          onPublishSuccess?.(result);
          if (result.failed === 0) {
            toast.success(`تم النشر بنجاح على ${result.successful} وجهة`);
          } else if (result.successful > 0) {
            toast.warning(`نجح ${result.successful} وفشل ${result.failed}`);
          } else {
            toast.error('فشل النشر على جميع الوجهات');
          }
        },
        onError: () => {
          toast.error('حدث خطأ أثناء النشر');
        },
      }
    );
  };

  // Check if any selected destination is X (for character limit warning)
  const hasXSelected = selectedDestinations.some(d => d.platform === 'X');
  const isOverXLimit = hasXSelected && postText.length > 280;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              نشر على منصات التواصل
            </CardTitle>
            <CardDescription>
              انشر محتواك مباشرة على X و Instagram
            </CardDescription>
          </div>
          <Badge variant={hasNoAccounts ? 'secondary' : 'default'}>
            {isLoadingAccounts ? '...' : hasNoAccounts ? 'غير متصل' : `${activeAccounts.length} حساب متصل`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Publish result alert */}
        {publishResult && (
          <Alert variant={publishResult.failed === 0 ? 'default' : 'destructive'}>
            {publishResult.failed === 0 ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>نتيجة النشر</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>نجح: {publishResult.successful} | فشل: {publishResult.failed}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {publishResult.jobs.map((job) => (
                  <Badge
                    key={job.id}
                    variant={job.status === 'Published' ? 'default' : 'destructive'}
                  >
                    {job.platformName}: {job.status === 'Published' ? 'نجح' : job.errorMessage || 'فشل'}
                  </Badge>
                ))}
              </div>
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/posts">عرض المنشورات</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasNoAccounts ? (
          /* No accounts state */
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">لم يتم ربط أي حسابات</h3>
            <p className="text-sm text-muted-foreground mb-4">
              قم بربط حساباتك على X أو Instagram للنشر مباشرة
            </p>
            <Button variant="outline" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 ml-2" />
                ربط حساب جديد
              </Link>
            </Button>
          </div>
        ) : (
          /* Publishing form */
          <div className="space-y-4">
            {/* Post text editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">نص المنشور</label>
              <Textarea
                placeholder="عدّل نص المنشور قبل النشر..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-xs">
                <span className={isOverXLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {postText.length} حرف
                  {hasXSelected && ` (الحد الأقصى لـ X: 280)`}
                </span>
                {isOverXLimit && (
                  <Badge variant="destructive">
                    تجاوز الحد المسموح لـ X
                  </Badge>
                )}
              </div>
            </div>

            {/* Destination selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">اختر وجهات النشر</label>
              <DestinationSelector
                accounts={activeAccounts}
                selectedDestinations={selectedDestinations}
                onToggle={toggleDestination}
                isLoading={isLoadingAccounts}
              />
            </div>

            {/* Selected destinations summary */}
            {selectedDestinations.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">سيتم النشر على:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDestinations.map((dest) => (
                    <Badge key={`${dest.accountId}-${dest.destinationId}`} variant="secondary">
                      {platformIcons[dest.platform]} {dest.accountName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Publish button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handlePublish}
              disabled={
                publishInstant.isPending ||
                !postText.trim() ||
                selectedDestinations.length === 0
              }
            >
              {publishInstant.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري النشر...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 ml-2" />
                  انشر الآن {selectedDestinations.length > 0 && `(${selectedDestinations.length} وجهة)`}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
