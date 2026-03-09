import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { CalendarClock, Coins, FolderKanban, Plus, Send, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandName } from '@/components/brand-name';
import { useProjects } from '@/features/projects';
import { useContentList } from '@/features/content';
import { useCreditBalance } from '@/features/credits';
import { IdeasWidget } from '@/features/content-ideas/components/IdeasWidget';
import { useScheduledPosts } from '@/features/publishing';
import { useAnalyticsSummary } from '@/features/analytics';
import { usePlanFeature } from '@/features/subscriptions';
import { useFeatureFlag } from '@/features/config/hooks/use-feature-flag';
import { formatDateTime, truncateText } from '@/utils';
import {
  CONTENT_PREVIEW_LENGTH,
  DASHBOARD_PROJECT_STORAGE_KEY,
  DASHBOARD_UPCOMING_SCHEDULED_COUNT,
  LOW_CREDIT_THRESHOLD,
  RECENT_CONTENT_COUNT,
} from '@/config/constants';

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();
  const { isEnabled: commandCenterEnabled } = useFeatureFlag('dashboard_command_center');
  const { isEnabled: contentIdeasEnabled } = useFeatureFlag('content_ideas_widget');
  const { isEnabled: analyticsWorkspaceEnabled } = useFeatureFlag('analytics_workspace');
  const { hasFeature: hasAnalyticsFeature } = usePlanFeature('analytics');

  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    if (!projects?.length) return;

    const storedProjectId = typeof window !== 'undefined'
      ? window.localStorage.getItem(DASHBOARD_PROJECT_STORAGE_KEY)
      : null;
    const defaultProjectId = projects.some((project) => project.id === storedProjectId)
      ? storedProjectId
      : projects[0].id;

    if (!selectedProjectId && defaultProjectId) {
      setSelectedProjectId(defaultProjectId);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId || typeof window === 'undefined') return;
    window.localStorage.setItem(DASHBOARD_PROJECT_STORAGE_KEY, selectedProjectId);
  }, [selectedProjectId]);

  const { data: contentItems, isLoading: isLoadingContent } = useContentList(selectedProjectId || undefined);
  const { data: scheduledPosts, isLoading: isLoadingScheduled } = useScheduledPosts(selectedProjectId || undefined);

  const analyticsEnabled = analyticsWorkspaceEnabled && hasAnalyticsFeature;
  const analyticsSummary = useAnalyticsSummary(selectedProjectId || undefined, analyticsEnabled);

  const recentContent = useMemo(
    () => (contentItems || []).slice(0, RECENT_CONTENT_COUNT),
    [contentItems]
  );
  const upcomingScheduled = useMemo(
    () => (scheduledPosts || []).slice(0, DASHBOARD_UPCOMING_SCHEDULED_COUNT),
    [scheduledPosts]
  );

  if (!commandCenterEnabled) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground">تم تعطيل لوحة القيادة المتقدمة من إعدادات الميزات.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            مركز العمل اليومي في <BrandName variant="short" />
          </p>
        </div>

        <div className="w-full max-w-sm">
          {isLoadingProjects ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المشروع" />
              </SelectTrigger>
              <SelectContent>
                {(projects || []).map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {creditBalance && creditBalance.available <= LOW_CREDIT_THRESHOLD && (
        <Alert>
          <Coins className="h-4 w-4" />
          <AlertTitle>الرصيد منخفض</AlertTitle>
          <AlertDescription>
            لديك {creditBalance.available} وحدة فقط. راجع الباقات قبل أن يتعطل العمل اليومي.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoadingProjects || isLoadingCredits ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard title="المشاريع" value={projects?.length || 0} description="المشاريع المتاحة" />
            <StatCard title="الرصيد المتبقي" value={creditBalance?.available || 0} description={`من ${creditBalance?.allocated || 0}`} />
            <StatCard title="المحتوى في المشروع" value={contentItems?.length || 0} description="مسودات ومحتوى جاهز" />
            <StatCard
              title="منشورات مجدولة"
              value={scheduledPosts?.length || 0}
              description={analyticsSummary.data ? `${analyticsSummary.data.totalPublishedPosts} منشور منشور` : 'تابع الجدولة والنشر'}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
            <CardDescription>ابدأ من الخطوة التالية مباشرة</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Link href="/create">
              <Card className="cursor-pointer transition-colors hover:bg-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4" />
                    إنشاء محتوى
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/calendar">
              <Card className="cursor-pointer transition-colors hover:bg-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarClock className="h-4 w-4" />
                    خطة التقويم
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/publish">
              <Card className="cursor-pointer transition-colors hover:bg-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Send className="h-4 w-4" />
                    نشر وجدولة
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لقطة التحليلات</CardTitle>
            <CardDescription>أهم المؤشرات للمشروع الحالي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!analyticsEnabled ? (
              <div className="text-sm text-muted-foreground">
                الترقية إلى باقة تدعم التحليلات لعرض أفضل الأوقات وأداء المنشورات.
              </div>
            ) : analyticsSummary.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : analyticsSummary.data ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground">إعجابات</div>
                    <div className="text-xl font-semibold">{analyticsSummary.data.totalLikes}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground">مشاركات</div>
                    <div className="text-xl font-semibold">{analyticsSummary.data.totalShares}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground">تعليقات</div>
                    <div className="text-xl font-semibold">{analyticsSummary.data.totalComments}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground">متوسط التفاعل</div>
                    <div className="text-xl font-semibold">{analyticsSummary.data.averageEngagementScore.toFixed(1)}</div>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/analytics">
                    <TrendingUp className="h-4 w-4 ml-2" />
                    فتح التحليلات
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد بيانات تحليلات بعد.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>المنشورات المجدولة القادمة</CardTitle>
                <CardDescription>المهام القريبة للمشروع الحالي</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/publish">
                  <Plus className="h-4 w-4 ml-1" />
                  جديد
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingScheduled ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : upcomingScheduled.length ? (
              upcomingScheduled.map((post) => (
                <div key={post.postId} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{truncateText(post.postText, CONTENT_PREVIEW_LENGTH * 3)}</div>
                    <Badge variant="outline">{post.jobs.length} وجهة</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(post.scheduledAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد منشورات مجدولة لهذا المشروع.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر المحتويات</CardTitle>
            <CardDescription>أحدث ما تم إنشاؤه داخل المشروع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingContent ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : recentContent.length ? (
              recentContent.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="font-medium">{truncateText(item.content, CONTENT_PREVIEW_LENGTH * 3)}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{item.templateName}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">لا يوجد محتوى حديث في هذا المشروع.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {contentIdeasEnabled && selectedProjectId && (
        <IdeasWidget projectId={selectedProjectId} hideProjectSelector initiallyOpen />
      )}

      {!selectedProjectId && !isLoadingProjects && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <FolderKanban className="mx-auto h-10 w-10 mb-3" />
            أنشئ مشروعاً أو اختر مشروعاً لبدء لوحة القيادة.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
