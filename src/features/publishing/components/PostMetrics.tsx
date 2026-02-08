import { useState } from 'react';
import { Eye, Heart, MessageCircle, Repeat2, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { usePostMetrics } from '../hooks/use-publishing';
import type { PostJob } from '../types';

interface PostMetricsProps {
  job: PostJob;
  className?: string;
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  loading?: boolean;
}

function MetricItem({ icon, label, value, loading }: MetricItemProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <Skeleton className="h-4 w-12" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{value?.toLocaleString() || '0'}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function PostMetrics({ job, className }: PostMetricsProps) {
  const [showMetrics, setShowMetrics] = useState(false);

  // Only fetch metrics for published posts and when metrics panel is open
  const shouldFetchMetrics = job.status === 'Published' && !!job.platformPostId && showMetrics;
  const { data: metrics, isLoading, error, refetch } = usePostMetrics(job.id, shouldFetchMetrics);

  // Don't show metrics button for non-published posts
  if (job.status !== 'Published' || !job.platformPostId) {
    return null;
  }

  const toggleMetrics = () => {
    setShowMetrics(!showMetrics);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMetrics}
        className="h-auto p-1 text-xs"
      >
        <BarChart3 className="h-3 w-3 ml-1" />
        {showMetrics ? 'إخفاء الإحصائيات' : 'عرض الإحصائيات'}
      </Button>

      {showMetrics && (
        <div className="mt-3 p-3 bg-muted rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">إحصائيات المنشور</h4>
            <div className="flex items-center gap-2">
              {metrics?.lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  آخر تحديث: {new Date(metrics.lastUpdated).toLocaleTimeString('ar-SA')}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-6 w-6 p-0"
              >
                <Loader2 className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              <MetricItem
                icon={<Heart className="h-4 w-4" />}
                label="إعجاب"
                value={undefined}
                loading
              />
              <MetricItem
                icon={<MessageCircle className="h-4 w-4" />}
                label="تعليق"
                value={undefined}
                loading
              />
              <MetricItem
                icon={<Repeat2 className="h-4 w-4" />}
                label="مشاركة"
                value={undefined}
                loading
              />
              <MetricItem
                icon={<Eye className="h-4 w-4" />}
                label="مشاهدة"
                value={undefined}
                loading
              />
            </div>
          ) : error || !metrics?.success ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>{metrics?.errorMessage || 'فشل في تحميل الإحصائيات'}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MetricItem
                  icon={<Heart className="h-4 w-4 text-red-500" />}
                  label="إعجاب"
                  value={metrics.likes}
                />
                <MetricItem
                  icon={<MessageCircle className="h-4 w-4 text-blue-500" />}
                  label="تعليق"
                  value={metrics.comments}
                />
                <MetricItem
                  icon={<Repeat2 className="h-4 w-4 text-green-500" />}
                  label="مشاركة"
                  value={metrics.shares}
                />
                <MetricItem
                  icon={<Eye className="h-4 w-4 text-purple-500" />}
                  label="مشاهدة"
                  value={metrics.views}
                />
              </div>

              {metrics.status && (
                <div className="pt-2 border-t">
                  <Badge variant="secondary" className="text-xs">
                    الحالة: {metrics.status}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}