import { useState } from 'react';
import { Clock, X, CalendarClock, Loader2, RotateCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useScheduledPosts, useRescheduleJob, useCancelScheduledJob } from '../hooks/use-publishing';
import type { ScheduledPostResponse, ScheduledJobInfo } from '../types';
import { formatDateTime } from '@/utils';
import { toast } from 'sonner';

const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <span className="text-xs">📷</span>,
  X: <span className="text-sm font-bold">𝕏</span>,
  Facebook: <span className="text-sm font-bold">f</span>,
  TikTok: <span className="text-sm">♪</span>,
};

export function ScheduledPostsList({ projectId }: { projectId?: string }) {
  const { data: scheduledPosts, isLoading } = useScheduledPosts(projectId);
  const [rescheduleJob, setRescheduleJob] = useState<ScheduledJobInfo | null>(null);
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const reschedule = useRescheduleJob();
  const cancelJob = useCancelScheduledJob();

  const handleReschedule = () => {
    if (!rescheduleJob || !newDate || !newTime) return;

    const newScheduledAt = new Date(`${newDate}T${newTime}:00`).toISOString();

    reschedule.mutate(
      { jobId: rescheduleJob.jobId, data: { newScheduledAt } },
      {
        onSuccess: () => {
          toast.success('تم إعادة جدولة المنشور بنجاح');
          setRescheduleJob(null);
          setNewDate('');
          setNewTime('');
        },
        onError: () => {
          toast.error('فشل إعادة جدولة المنشور');
        },
      }
    );
  };

  const handleCancel = () => {
    if (!cancelJobId) return;

    cancelJob.mutate(cancelJobId, {
      onSuccess: () => {
        toast.success('تم إلغاء الجدولة بنجاح');
        setCancelJobId(null);
      },
      onError: () => {
        toast.error('فشل إلغاء الجدولة');
        setCancelJobId(null);
      },
    });
  };

  const openReschedule = (job: ScheduledJobInfo) => {
    const date = new Date(job.scheduledAt);
    setNewDate(date.toISOString().split('T')[0]);
    setNewTime(date.toTimeString().slice(0, 5));
    setRescheduleJob(job);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!scheduledPosts || scheduledPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">لا توجد منشورات مجدولة</p>
          <p className="text-sm text-muted-foreground">
            قم بجدولة منشور من صفحة النشر وسيظهر هنا
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {scheduledPosts.map((post) => (
          <ScheduledPostCard
            key={post.postId}
            post={post}
            onReschedule={openReschedule}
            onCancel={(jobId) => setCancelJobId(jobId)}
          />
        ))}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleJob} onOpenChange={() => setRescheduleJob(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إعادة جدولة المنشور</DialogTitle>
            <DialogDescription>
              اختر التاريخ والوقت الجديد لنشر المنشور
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>الوقت</Label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleJob(null)}>
              إلغاء
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!newDate || !newTime || reschedule.isPending}
            >
              {reschedule.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={!!cancelJobId}
        onOpenChange={() => setCancelJobId(null)}
        title="إلغاء الجدولة"
        description="هل أنت متأكد من إلغاء جدولة هذا المنشور؟ لن يتم نشره في الوقت المحدد."
        onConfirm={handleCancel}
        isPending={cancelJob.isPending}
      />
    </>
  );
}

function ScheduledPostCard({
  post,
  onReschedule,
  onCancel,
}: {
  post: ScheduledPostResponse;
  onReschedule: (job: ScheduledJobInfo) => void;
  onCancel: (jobId: string) => void;
}) {
  const activeJobs = post.jobs.filter(j => j.status === 'Scheduled');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">
              {post.postText.slice(0, 80)}{post.postText.length > 80 ? '...' : ''}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(post.scheduledAt)}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 shrink-0">
            <Clock className="h-3 w-3 ml-1" />
            مجدول
          </Badge>
        </div>
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {activeJobs.map((job) => (
            <div
              key={job.jobId}
              className="flex items-center justify-between p-2.5 rounded-lg bg-muted"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-background rounded-full">
                  {platformIcons[job.platformName]}
                </span>
                <div>
                  <p className="text-sm font-medium">{job.destinationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(job.scheduledAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onReschedule(job)}
                  title="إعادة جدولة"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onCancel(job.jobId)}
                  title="إلغاء"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
