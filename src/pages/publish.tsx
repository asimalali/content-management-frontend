import { useState, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Instagram,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useProjects } from '@/features/projects';
import { useContentList } from '@/features/content';
import { useConnectedAccounts, useDestinations, type ConnectedAccount, type Destination } from '@/features/integrations';
import { usePublishInstant, type PublishDestination, type PublishResult } from '@/features/publishing';
import { OptimizationDialog } from '@/features/content-optimization';
import { toast } from 'sonner';

// Platform icons
const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  X: <span className="text-sm font-bold">𝕏</span>,
  Facebook: <span className="text-sm font-bold">f</span>,
  TikTok: <span className="text-sm">♪</span>,
};

const statusColors: Record<string, string> = {
  Connected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Revoked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface SelectedDestination {
  accountId: string;
  destinationId: string; // Platform-specific destination ID for API
  accountName: string;
  platform: string;
}

export default function PublishPage() {
  // Get query params from URL
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialProjectId = urlParams.get('projectId') || '';
  const initialContentId = urlParams.get('contentId') || '';

  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [postText, setPostText] = useState<string>('');
  const [hashtagInput, setHashtagInput] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<SelectedDestination[]>([]);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [contentInitialized, setContentInitialized] = useState(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);

  // Fetch data
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: contentItems, isLoading: isLoadingContent } = useContentList(selectedProjectId || undefined);
  const { data: connectedAccounts, isLoading: isLoadingAccounts } = useConnectedAccounts();

  // Publish mutation
  const publishInstant = usePublishInstant();

  // Initialize content from URL params once content items are loaded
  useEffect(() => {
    if (!contentInitialized && initialContentId && contentItems && contentItems.length > 0) {
      const content = contentItems.find(c => c.id === initialContentId);
      if (content) {
        setSelectedContentId(initialContentId);
        setPostText(content.content);
      }
      setContentInitialized(true);
    }
  }, [initialContentId, contentItems, contentInitialized]);

  // Load content text when content is selected by user
  useEffect(() => {
    if (contentInitialized && selectedContentId && contentItems) {
      const content = contentItems.find(c => c.id === selectedContentId);
      if (content) {
        setPostText(content.content);
      } else if (!selectedContentId) {
        // If "manual writing" is selected, clear text
      }
    }
  }, [selectedContentId, contentItems, contentInitialized]);

  // Handle hashtag input
  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  // Handle optimization completion
  const handleOptimizationComplete = (optimizedTexts: Record<string, string>) => {
    // For now, just use the first optimized text
    const firstOptimizedText = Object.values(optimizedTexts)[0];
    if (firstOptimizedText) {
      setPostText(firstOptimizedText);
      toast.success('تم تحسين المحتوى بنجاح');
    }
  };

  // Handle opening optimization dialog
  const handleOpenOptimization = () => {
    if (!selectedProjectId) {
      toast.error('يرجى اختيار المشروع أولاً');
      return;
    }
    if (!postText.trim()) {
      toast.error('يرجى كتابة نص المنشور أولاً');
      return;
    }
    setShowOptimizationDialog(true);
  };

  // Handle destination toggle
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

  const isDestinationSelected = (accountId: string, destinationId: string) => {
    return selectedDestinations.some(
      d => d.accountId === accountId && d.destinationId === destinationId
    );
  };

  // Handle publish
  const handlePublish = () => {
    if (!selectedProjectId) {
      toast.error('يرجى اختيار المشروع');
      return;
    }
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
        projectId: selectedProjectId,
        contentItemId: selectedContentId || undefined,
        postText,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        destinations,
      },
      {
        onSuccess: (result) => {
          setPublishResult(result);
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

  // Filter connected accounts (only show connected status)
  const activeAccounts = connectedAccounts?.filter(a => a.status === 'Connected') || [];
  const inactiveAccounts = connectedAccounts?.filter(a => a.status !== 'Connected') || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">نشر محتوى</h1>
          <p className="text-muted-foreground">
            انشر محتواك على منصات التواصل الاجتماعي
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4 ml-2" />
            عرض المنشورات
          </Link>
        </Button>
      </div>

      {/* Publishing Result Alert */}
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
              <Link href={`/posts`}>عرض التفاصيل</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النشر</CardTitle>
              <CardDescription>اختر المشروع والمحتوى</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Selector */}
              <div className="space-y-2">
                <Label>المشروع</Label>
                {isLoadingProjects ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Content Selector */}
              {selectedProjectId && (
                <div className="space-y-2">
                  <Label>المحتوى (اختياري)</Label>
                  {isLoadingContent ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={selectedContentId || 'manual'}
                      onValueChange={(value) => setSelectedContentId(value === 'manual' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر محتوى موجود أو اكتب يدوياً" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">كتابة يدوية</SelectItem>
                        {contentItems?.map((content) => (
                          <SelectItem key={content.id} value={content.id}>
                            {content.templateName} - {content.content.substring(0, 30)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <Separator />

              {/* Post Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>نص المنشور</Label>
                  {selectedProjectId && postText.trim() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenOptimization}
                      className="h-8 px-3 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      تحسين بالذكاء الاصطناعي
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="اكتب نص المنشور هنا..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-left" dir="ltr">
                  {postText.length} / 2200 character
                </p>
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <Label>الهاشتاقات</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="#هاشتاق"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHashtag();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddHashtag}>
                    إضافة
                  </Button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveHashtag(tag)}
                      >
                        #{tag} ✕
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Destination Selection */}
          <Card>
            <CardHeader>
              <CardTitle>وجهات النشر</CardTitle>
              <CardDescription>اختر الحسابات التي تريد النشر عليها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAccounts ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : activeAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    لم يتم ربط أي حسابات بعد
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/settings">ربط حساب جديد</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAccounts.map((account) => (
                    <DestinationCard
                      key={account.id}
                      account={account}
                      isSelected={isDestinationSelected}
                      onToggle={toggleDestination}
                    />
                  ))}
                </div>
              )}

              {/* Inactive accounts */}
              {inactiveAccounts.length > 0 && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">حسابات غير نشطة</p>
                  <div className="space-y-2 opacity-60">
                    {inactiveAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full">
                            {platformIcons[account.platform]}
                          </span>
                          <div>
                            <p className="font-medium text-sm">
                              {account.displayName || account.platformUsername}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{account.platformUsername}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={statusColors[account.status]}>
                          {account.status === 'Expired' && 'منتهي'}
                          {account.status === 'Revoked' && 'ملغى'}
                          {account.status === 'Error' && 'خطأ'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Publish Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handlePublish}
            disabled={
              publishInstant.isPending ||
              !selectedProjectId ||
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
                نشر الآن ({selectedDestinations.length} وجهة)
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معاينة</CardTitle>
              <CardDescription>كيف سيظهر منشورك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                {/* Instagram-style preview */}
                <div className="bg-white dark:bg-zinc-900 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 flex items-center justify-center text-white text-sm">
                      📷
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {selectedDestinations[0]?.accountName || 'حسابك'}
                      </p>
                      <p className="text-xs text-muted-foreground">الآن</p>
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">صورة/فيديو</p>
                  </div>

                  {/* Caption */}
                  <div className="space-y-2">
                    <p className="text-sm whitespace-pre-wrap" dir="auto">
                      {postText || 'نص المنشور سيظهر هنا...'}
                    </p>
                    {hashtags.length > 0 && (
                      <p className="text-sm text-blue-500">
                        {hashtags.map(t => `#${t}`).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected destinations summary */}
              {selectedDestinations.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Optimization Dialog */}
      <OptimizationDialog
        isOpen={showOptimizationDialog}
        onClose={() => setShowOptimizationDialog(false)}
        originalText={postText}
        hashtags={hashtags}
        projectId={selectedProjectId}
        onOptimizationComplete={handleOptimizationComplete}
      />
    </div>
  );
}

// Destination card component with destinations loading
function DestinationCard({
  account,
  isSelected,
  onToggle,
}: {
  account: ConnectedAccount;
  isSelected: (accountId: string, destinationId: string) => boolean;
  onToggle: (account: ConnectedAccount, destination: Destination) => void;
}) {
  const { data: destinations, isLoading } = useDestinations(account.id);

  // If no destinations loaded yet, use default destination
  const destinationList = destinations || [
    {
      destinationId: account.platformUserId || 'timeline',
      name: account.displayName || account.platformUsername,
      type: 'profile',
    },
  ];

  return (
    <div className="p-3 rounded-lg bg-muted space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full">
          {platformIcons[account.platform]}
        </span>
        <div className="flex-1">
          <p className="font-medium text-sm">
            {account.displayName || account.platformUsername}
          </p>
          <p className="text-xs text-muted-foreground">@{account.platformUsername}</p>
        </div>
        <Badge variant="secondary" className={statusColors[account.status]}>
          متصل
        </Badge>
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        <div className="space-y-1 mr-11">
          {destinationList.map((dest) => (
            <div
              key={dest.destinationId}
              className="flex items-center gap-2 p-2 rounded hover:bg-background cursor-pointer"
              onClick={() => onToggle(account, dest)}
            >
              <Checkbox
                checked={isSelected(account.id, dest.destinationId)}
                onCheckedChange={() => onToggle(account, dest)}
              />
              <span className="text-sm">{dest.name}</span>
              {dest.type && (
                <Badge variant="outline" className="text-xs">
                  {dest.type === 'profile' ? 'ملف شخصي' : dest.type}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
