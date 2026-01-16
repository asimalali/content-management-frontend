import { useState } from 'react';
import { Link } from 'wouter';
import { Copy, Check, Trash2, Search, FileText, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentList, useDeleteContent, type ContentItem } from '@/features/content';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = {
  Draft: 'مسودة',
  Final: 'نهائي',
  Published: 'منشور',
  Archived: 'مؤرشف',
};

const statusColors: Record<string, string> = {
  Draft: 'secondary',
  Final: 'default',
  Published: 'outline',
  Archived: 'destructive',
};

function ContentCard({
  content,
  onView,
  onDelete,
  isDeleting,
}: {
  content: ContentItem;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(content.content);
    setCopied(true);
    toast.success('تم نسخ المحتوى');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onView}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {content.title && (
              <CardTitle className="text-base">{content.title}</CardTitle>
            )}
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[content.status] as "default" | "secondary" | "destructive" | "outline"}>
                {statusLabels[content.status]}
              </Badge>
              {content.templateName && (
                <Badge variant="outline" className="text-xs">
                  {content.templateName}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/publish?contentId=${content.id}&projectId=${content.projectId}`}>
                <Send className="h-4 w-4 text-primary" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
          {content.content}
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{new Date(content.createdAt).toLocaleDateString('ar-SA')}</span>
          <span>{content.creditsUsed} وحدة</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">لا يوجد محتوى</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        ابدأ بإنشاء محتوى جديد باستخدام الذكاء الاصطناعي
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <FileText className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">حدث خطأ</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        تعذر تحميل المحتوى. يرجى المحاولة مرة أخرى.
      </p>
      <Button onClick={onRetry} variant="outline">
        إعادة المحاولة
      </Button>
    </div>
  );
}

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewContent, setViewContent] = useState<ContentItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch content from API
  const { data: contents, isLoading, isError, refetch } = useContentList();

  // Delete mutation
  const deleteContent = useDeleteContent();

  const filteredContents = (contents || []).filter((c) =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.templateName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteId) return;

    deleteContent.mutate(deleteId, {
      onSuccess: () => {
        toast.success('تم حذف المحتوى بنجاح');
        setDeleteId(null);
      },
      onError: () => {
        toast.error('فشل حذف المحتوى');
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">مكتبة المحتوى</h1>
        <p className="text-muted-foreground">
          جميع المحتويات المُنشأة بالذكاء الاصطناعي
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث في المحتوى..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-9"
        />
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ContentCardSkeleton />
          <ContentCardSkeleton />
          <ContentCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filteredContents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onView={() => setViewContent(content)}
              onDelete={() => setDeleteId(content.id)}
              isDeleting={deleteContent.isPending && deleteId === content.id}
            />
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewContent} onOpenChange={() => setViewContent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewContent?.title || 'عرض المحتوى'}</DialogTitle>
            <DialogDescription>
              <span className="flex items-center gap-2">
                {viewContent?.templateName && (
                  <Badge variant="outline">{viewContent.templateName}</Badge>
                )}
                <span>
                  تم إنشاؤه في {viewContent && new Date(viewContent.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm max-h-96 overflow-auto">
            {viewContent?.content}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا المحتوى نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteContent.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteContent.isPending}
            >
              {deleteContent.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
