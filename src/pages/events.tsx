import { useState } from 'react';
import {
  Globe,
  TrendingUp,
  Calendar,
  Sparkles,
  Loader2,
  ExternalLink,
  Users,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents, useGenerateFromEvent } from '@/features/events';
import { useTrends, useGenerateFromTrend } from '@/features/trends';
import { useFeatureFlag } from '@/features/config/hooks/use-feature-flag';
import { useProjects } from '@/features/projects';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import type { GlobalEventResponse } from '@/features/events';
import type { MonthlyTrendResponse } from '@/features/trends';

const CATEGORY_LABELS: Record<string, string> = {
  Commercial: 'تجاري',
  Cultural: 'ثقافي',
  Religious: 'ديني',
  Sports: 'رياضي',
  Health: 'صحي',
  Social: 'اجتماعي',
  Technical: 'تقني',
  Environmental: 'بيئي',
  Educational: 'تعليمي',
};

const CATEGORY_COLORS: Record<string, string> = {
  Commercial: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Cultural: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Religious: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  Sports: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Social: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Technical: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Environmental: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Educational: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

const PLATFORM_LABELS: Record<string, string> = {
  X: 'X (تويتر)',
  Instagram: 'انستقرام',
  TikTok: 'تيك توك',
  Facebook: 'فيسبوك',
};

const MONTHS = [
  { value: '1', label: 'يناير' },
  { value: '2', label: 'فبراير' },
  { value: '3', label: 'مارس' },
  { value: '4', label: 'أبريل' },
  { value: '5', label: 'مايو' },
  { value: '6', label: 'يونيو' },
  { value: '7', label: 'يوليو' },
  { value: '8', label: 'أغسطس' },
  { value: '9', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
];

export default function EventsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear] = useState(now.getFullYear());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [generateDialog, setGenerateDialog] = useState<{
    type: 'event' | 'trend';
    item: GlobalEventResponse | MonthlyTrendResponse;
  } | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { isEnabled: isMonthlyTrendsEnabled, isComingSoon: isMonthlyTrendsComingSoon } =
    useFeatureFlag('monthly_trends');

  const { data: events, isLoading: eventsLoading } = useEvents({
    month: selectedMonth,
    year: selectedYear,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const { data: trends, isLoading: trendsLoading } = useTrends(
    {
      month: selectedMonth,
      year: selectedYear,
      platform: platformFilter !== 'all' ? platformFilter : undefined,
    },
    { enabled: isMonthlyTrendsEnabled }
  );

  const { data: projects } = useProjects();
  const generateFromEvent = useGenerateFromEvent();
  const generateFromTrend = useGenerateFromTrend();

  const isGenerating = generateFromEvent.isPending || generateFromTrend.isPending;

  const handleGenerate = async () => {
    if (!generateDialog || !selectedProjectId) return;

    try {
      if (generateDialog.type === 'event') {
        await generateFromEvent.mutateAsync({
          eventId: generateDialog.item.id,
          data: { projectId: selectedProjectId, language: 'ar' },
        });
      } else {
        await generateFromTrend.mutateAsync({
          trendId: generateDialog.item.id,
          data: { projectId: selectedProjectId, language: 'ar' },
        });
      }
      toast.success('تم إنشاء المحتوى بنجاح');
      setGenerateDialog(null);
      setSelectedProjectId('');
    } catch {
      toast.error('فشل في إنشاء المحتوى');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="المناسبات والتوجهات"
        description="استلهم محتوى من المناسبات العالمية والتوجهات الشهرية"
      />

      <Tabs defaultValue="events" dir="rtl">
        <TabsList>
          <TabsTrigger value="events" className="gap-2">
            <Globe className="h-4 w-4" />
            المناسبات
          </TabsTrigger>
          {(isMonthlyTrendsEnabled || isMonthlyTrendsComingSoon) && (
            <TabsTrigger value="trends" className="gap-2">
              {isMonthlyTrendsComingSoon ? (
                <Lock className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isMonthlyTrendsComingSoon ? 'التوجهات (قريباً)' : 'التوجهات'}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ─── Events Tab ─── */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="secondary">{events?.length ?? 0} مناسبة</Badge>
          </div>

          {eventsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : !events?.length ? (
            <EmptyState
              icon={Calendar}
              title="لا توجد مناسبات"
              description="لا توجد مناسبات لهذا الشهر"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">
                        {event.titleAr}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={CATEGORY_COLORS[event.category] ?? ''}
                      >
                        {CATEGORY_LABELS[event.category] ?? event.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {event.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.descriptionAr}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.eventDate)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() =>
                          setGenerateDialog({ type: 'event', item: event })
                        }
                      >
                        <Sparkles className="h-3 w-3" />
                        إنشاء محتوى
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Trends Tab ─── */}
        {(isMonthlyTrendsEnabled || isMonthlyTrendsComingSoon) && (
          <TabsContent value="trends" className="space-y-4">
            {isMonthlyTrendsComingSoon && !isMonthlyTrendsEnabled ? (
              <EmptyState
                icon={Lock}
                title="ميزة التوجهات قريباً"
                description="هذه الميزة متاحة للعرض فقط حالياً وسيتم تفعيلها قريباً."
              />
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={String(selectedMonth)}
                    onValueChange={(v) => setSelectedMonth(Number(v))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="المنصة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المنصات</SelectItem>
                      {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Badge variant="secondary">{trends?.length ?? 0} توجه</Badge>
                </div>

                {trendsLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                  </div>
                ) : !trends?.length ? (
                  <EmptyState
                    icon={TrendingUp}
                    title="لا توجد توجهات"
                    description="لا توجد توجهات لهذا الشهر. سيتم إضافتها من قبل الإدارة."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {trends.map((trend) => (
                      <Card key={trend.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base leading-snug">
                              {trend.titleAr}
                            </CardTitle>
                            <Badge variant="outline">
                              {PLATFORM_LABELS[trend.platform] ?? trend.platform}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {trend.title}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {trend.descriptionAr}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {trend.contentType}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {trend.usageCount} استخدام
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            {trend.sourceUrl && (
                              <a
                                href={trend.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary flex items-center gap-1 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                المصدر
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 mr-auto"
                              onClick={() =>
                                setGenerateDialog({ type: 'trend', item: trend })
                              }
                            >
                              <Sparkles className="h-3 w-3" />
                              إنشاء محتوى
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* ─── Generate Content Dialog ─── */}
      <Dialog
        open={!!generateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setGenerateDialog(null);
            setSelectedProjectId('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء محتوى</DialogTitle>
            <DialogDescription>
              {generateDialog?.type === 'event'
                ? `إنشاء محتوى مستوحى من مناسبة: ${(generateDialog.item as GlobalEventResponse).titleAr}`
                : `إنشاء محتوى مستوحى من توجه: ${(generateDialog?.item as MonthlyTrendResponse)?.titleAr ?? ''}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اختر المشروع</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مشروعاً" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              سيتم خصم رصيد واحد لإنشاء المحتوى
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGenerateDialog(null);
                setSelectedProjectId('');
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!selectedProjectId || isGenerating}
            >
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              إنشاء المحتوى
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
