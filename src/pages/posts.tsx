import { useState } from 'react';
import { Link } from 'wouter';
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trash2,
  Eye,
  Instagram,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  usePosts,
  usePostJobs,
  useRetryJob,
  useDeletePost,
  PostMetrics,
  type Post,
  type PostJob,
} from '@/features/publishing';
import { toast } from 'sonner';

// Platform icons
const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  X: <span className="text-sm font-bold">𝕏</span>,
  Facebook: <span className="text-sm font-bold">f</span>,
  TikTok: <span className="text-sm">♪</span>,
};

const jobStatusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  Published: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'تم النشر',
  },
  Failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'فشل',
  },
  Publishing: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    label: 'جاري النشر',
  },
  Draft: {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    label: 'مسودة',
  },
  Scheduled: {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    label: 'مجدول',
  },
  Cancelled: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    label: 'ملغى',
  },
};

export default function PostsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch posts
  const { data: posts, isLoading } = usePosts();
  const deletePost = useDeletePost();

  const handleDelete = () => {
    if (!deleteId) return;

    deletePost.mutate(deleteId, {
      onSuccess: () => {
        toast.success('تم حذف المنشور');
        setDeleteId(null);
      },
      onError: () => {
        toast.error('فشل حذف المنشور');
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المنشورات</h1>
          <p className="text-muted-foreground">
            عرض وإدارة منشوراتك على منصات التواصل الاجتماعي
          </p>
        </div>
        <Button asChild>
          <Link href="/publish">
            <Plus className="h-4 w-4 ml-2" />
            نشر جديد
          </Link>
        </Button>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد منشورات</h3>
              <p className="text-sm text-muted-foreground mb-4">
                لم تقم بنشر أي محتوى بعد
              </p>
              <Button asChild>
                <Link href="/publish">نشر محتوى جديد</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={() => setDeleteId(post.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف المنشور؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المنشور نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePost.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePost.isPending}
            >
              {deletePost.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Individual post card
function PostCard({ post, onDelete }: { post: Post; onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: jobs, isLoading: isLoadingJobs } = usePostJobs(isOpen ? post.id : undefined);

  const hasFailedJobs = post.failedJobs > 0;
  const allSuccessful = post.failedJobs === 0 && post.successfulJobs > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <span className="line-clamp-1">
                {post.postText.substring(0, 50)}{post.postText.length > 50 ? '...' : ''}
              </span>
            </CardTitle>
            <CardDescription>
              {new Date(post.createdAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {allSuccessful && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle2 className="h-3 w-3 ml-1" />
                تم النشر
              </Badge>
            )}
            {hasFailedJobs && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 ml-1" />
                {post.failedJobs} فشل
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Post text preview */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm whitespace-pre-wrap line-clamp-3">{post.postText}</p>
          {post.hashtags.length > 0 && (
            <p className="text-sm text-blue-500 mt-2">
              {post.hashtags.map(t => `#${t}`).join(' ')}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>الإجمالي: {post.totalJobs}</span>
          <span className="text-green-600">نجح: {post.successfulJobs}</span>
          <span className="text-red-600">فشل: {post.failedJobs}</span>
        </div>

        <Separator />

        {/* Jobs collapsible */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 ml-2" />
                {isOpen ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
              </Button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </Button>
          </div>

          <CollapsibleContent className="mt-4 space-y-2">
            {isLoadingJobs ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => <JobItem key={job.id} job={job} />)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد تفاصيل
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Individual job item
function JobItem({ job }: { job: PostJob }) {
  const retryJob = useRetryJob();
  const statusConfig = jobStatusConfig[job.status] || jobStatusConfig.Draft;

  const handleRetry = () => {
    retryJob.mutate(job.id, {
      onSuccess: () => {
        toast.success('تم إعادة محاولة النشر');
      },
      onError: () => {
        toast.error('فشل إعادة المحاولة');
      },
    });
  };

  return (
    <div className="p-3 bg-muted rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full">
            {platformIcons[job.platformName] || job.platformName[0]}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{job.destinationName}</p>
              <Badge variant="secondary" className={statusConfig.color}>
                {statusConfig.icon}
                <span className="mr-1">{statusConfig.label}</span>
              </Badge>
            </div>
            {job.publishedAt && (
              <p className="text-xs text-muted-foreground">
                {new Date(job.publishedAt).toLocaleDateString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {job.errorMessage && (
              <p className="text-xs text-red-500 mt-1">{job.errorMessage}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.platformUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={job.platformUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
              </a>
            </Button>
          )}
          {job.status === 'Failed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retryJob.isPending}
            >
              {retryJob.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 ml-1" />
                  إعادة
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Add metrics component for published posts */}
      <PostMetrics job={job} />
    </div>
  );
}
