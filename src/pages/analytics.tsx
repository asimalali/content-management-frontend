import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Clock3, Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProjects } from '@/features/projects';
import { useAnalyticsBestTimes, useAnalyticsSummary } from '@/features/analytics';
import { useGenerateInsights, type PerformanceInsightsResponse } from '@/features/content-optimization';
import { useFeatureFlag } from '@/features/config/hooks/use-feature-flag';
import { usePlanFeature } from '@/features/subscriptions';
import { formatDateTime, truncateText } from '@/utils';
import { CONTENT_PREVIEW_LENGTH } from '@/config/constants';

const weekdayLabels = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

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

export default function AnalyticsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [insights, setInsights] = useState<PerformanceInsightsResponse | null>(null);

  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { isEnabled: analyticsWorkspaceEnabled } = useFeatureFlag('analytics_workspace');
  const { hasFeature: hasAnalyticsFeature, isLoading: isLoadingEntitlement } = usePlanFeature('analytics');

  useEffect(() => {
    if (!selectedProjectId && projects && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const analyticsEnabled = analyticsWorkspaceEnabled && hasAnalyticsFeature;
  const summaryQuery = useAnalyticsSummary(selectedProjectId || undefined, analyticsEnabled);
  const bestTimesQuery = useAnalyticsBestTimes(selectedProjectId || undefined, analyticsEnabled);
  const generateInsights = useGenerateInsights();

  const heatmapRows = useMemo(() => {
    const heatmap = summaryQuery.data?.engagementHeatmap ?? [];
    return weekdayLabels.map((label, dayIndex) => ({
      label,
      points: heatmap.filter((point) => point.dayOfWeek === dayIndex),
    }));
  }, [summaryQuery.data?.engagementHeatmap]);

  const handleGenerateInsights = () => {
    if (!selectedProjectId) return;

    generateInsights.mutate(
      { ProjectId: selectedProjectId, Language: 'ar' },
      {
        onSuccess: (result) => setInsights(result),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="التحليلات"
        description="مؤشرات الأداء، أفضل أوقات النشر، ورؤى الذكاء الاصطناعي"
      />

      <Card>
        <CardHeader>
          <CardTitle>المشروع</CardTitle>
          <CardDescription>اختر المشروع لعرض التحليلات الخاصة به</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProjects ? (
            <Skeleton className="h-10 w-64" />
          ) : (
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full max-w-sm">
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
        </CardContent>
      </Card>

      {!analyticsWorkspaceEnabled && (
        <Alert>
          <BarChart3 className="h-4 w-4" />
          <AlertTitle>التحليلات معطلة</AlertTitle>
          <AlertDescription>
            تم إيقاف مساحة التحليلات عبر إعدادات الميزات.
          </AlertDescription>
        </Alert>
      )}

      {analyticsWorkspaceEnabled && !isLoadingEntitlement && !hasAnalyticsFeature && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>هذه الميزة ضمن الباقات الاحترافية</AlertTitle>
          <AlertDescription>
            يلزم تفعيل ميزة التحليلات في باقتك الحالية لعرض المؤشرات وأفضل الأوقات.
          </AlertDescription>
        </Alert>
      )}

      {analyticsEnabled && selectedProjectId && (
        <>
          {summaryQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : summaryQuery.data ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="المنشورات المنشورة" value={summaryQuery.data.totalPublishedPosts} />
              <StatCard title="إجمالي الإعجابات" value={summaryQuery.data.totalLikes} />
              <StatCard title="إجمالي المشاركات" value={summaryQuery.data.totalShares} />
              <StatCard
                title="متوسط التفاعل"
                value={summaryQuery.data.averageEngagementScore.toFixed(1)}
                description={`${summaryQuery.data.totalViews} مشاهدة`}
              />
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>تفصيل المنصات</CardTitle>
                <CardDescription>ملخص الأداء لكل منصة مرتبطة بالمشروع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summaryQuery.data?.platformBreakdown.length ? (
                  summaryQuery.data.platformBreakdown.map((platform) => (
                    <div key={platform.platform} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{platform.platform}</div>
                        <Badge variant="secondary">{platform.publishedJobs} منشور</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>إعجابات: {platform.likes}</div>
                        <div>تعليقات: {platform.comments}</div>
                        <div>مشاركات: {platform.shares}</div>
                        <div>مشاهدات: {platform.views}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">لا توجد بيانات أداء منشورة بعد.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>رؤى الذكاء الاصطناعي</CardTitle>
                    <CardDescription>تحليل سريع للمنشورات المنشورة في المشروع</CardDescription>
                  </div>
                  <Button onClick={handleGenerateInsights} disabled={generateInsights.isPending}>
                    {generateInsights.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 ml-2" />
                    )}
                    إنشاء الرؤى
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights ? (
                  <>
                    <div className="text-sm text-muted-foreground">
                      تم تحليل {insights.totalPostsAnalyzed} منشور
                    </div>
                    {insights.insights.slice(0, 3).map((insight, index) => (
                      <div key={`${insight.title}-${index}`} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <div className="font-medium text-sm">{insight.title}</div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{insight.description}</p>
                        <p className="text-sm mt-2">{insight.actionableAdvice}</p>
                      </div>
                    ))}
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      {insights.overallSummary}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    اطلب الرؤى لتوليد ملخص ذكي للتوقيت والمحتوى وأفضل فرص التحسين.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>أفضل المنشورات</CardTitle>
                <CardDescription>أعلى المنشورات أداءً بناءً على التفاعل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summaryQuery.data?.topPosts.length ? (
                  summaryQuery.data.topPosts.map((post) => (
                    <div key={post.jobId} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.publishedAt ? formatDateTime(post.publishedAt) : 'غير محدد'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{truncateText(post.postText, CONTENT_PREVIEW_LENGTH * 4)}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        نتيجة التفاعل: {post.engagementScore.toFixed(1)} | إعجابات {post.likes} | تعليقات {post.comments}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">لا توجد منشورات كافية لعرض أفضل النتائج.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل أوقات النشر</CardTitle>
                <CardDescription>مبنية على أداء المنشورات السابقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bestTimesQuery.isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : bestTimesQuery.data?.recommendations.length ? (
                  bestTimesQuery.data.recommendations.map((recommendation) => (
                    <div key={`${recommendation.platform}-${recommendation.dayOfWeek}-${recommendation.hourOfDay}`} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <Badge>{recommendation.platform}</Badge>
                        <span className="text-xs text-muted-foreground">
                          ثقة {Math.round(recommendation.confidence * 100)}%
                        </span>
                      </div>
                      <div className="mt-2 font-medium">
                        {weekdayLabels[recommendation.dayOfWeek]} الساعة {recommendation.hourOfDay.toString().padStart(2, '0')}:{recommendation.minute.toString().padStart(2, '0')}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        متوسط التفاعل {recommendation.averageEngagementScore.toFixed(1)} من {recommendation.sampleSize} عينة
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {bestTimesQuery.data?.message ?? 'لا توجد بيانات كافية لتوصية أوقات النشر.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>خريطة التفاعل الزمنية</CardTitle>
              <CardDescription>متوسط التفاعل حسب اليوم والساعة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {heatmapRows.some((row) => row.points.length > 0) ? (
                heatmapRows.map((row) => (
                  <div key={row.label} className="grid gap-2 md:grid-cols-[120px_1fr]">
                    <div className="text-sm font-medium">{row.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {row.points.map((point) => (
                        <Badge key={`${row.label}-${point.hourOfDay}`} variant="secondary">
                          {point.hourOfDay.toString().padStart(2, '0')}:00
                          {' · '}
                          {point.averageEngagementScore.toFixed(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  ستظهر الخريطة بعد توفر منشورات منشورة ببيانات أداء كافية.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
