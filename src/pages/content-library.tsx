import { useState } from 'react';
import { Link } from 'wouter';
import { Copy, Check, Trash2, Search, FileText, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContentList, useDeleteContent, ContentDetailDialog, type ContentItem, type ContentStatus } from '@/features/content';
import { toast } from 'sonner';
import { CONTENT_STATUS_CONFIG } from '@/config/platform';
import { formatDate, copyToClipboard } from '@/utils';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { ConfirmDialog } from '@/components/confirm-dialog';

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
    await copyToClipboard(content.content, setCopied);
    toast.success('تم نسخ المحتوى');
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
              <Badge variant={(CONTENT_STATUS_CONFIG[content.status]?.variant ?? 'secondary') as "default" | "secondary" | "destructive" | "outline"}>
                {CONTENT_STATUS_CONFIG[content.status]?.label ?? content.status}
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
          <span>{formatDate(content.createdAt)}</span>
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

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [viewContent, setViewContent] = useState<ContentItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch content from API
  const { data: contents, isLoading, isError, refetch } = useContentList();

  // Delete mutation
  const deleteContent = useDeleteContent();

  const filteredContents = (contents || []).filter((c) => {
    const matchesSearch =
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.templateName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <PageHeader
        title="مكتبة المحتوى"
        description="جميع المحتويات المُنشأة بالذكاء الاصطناعي"
      />

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث في المحتوى..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="Draft">مسودة</SelectItem>
            <SelectItem value="Final">نهائي</SelectItem>
            <SelectItem value="Published">منشور</SelectItem>
            <SelectItem value="Archived">مؤرشف</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ContentCardSkeleton />
          <ContentCardSkeleton />
          <ContentCardSkeleton />
        </div>
      ) : isError ? (
        <EmptyState
          icon={FileText}
          title="حدث خطأ"
          description="تعذر تحميل المحتوى. يرجى المحاولة مرة أخرى."
          variant="error"
          onRetry={() => refetch()}
        />
      ) : filteredContents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="لا يوجد محتوى"
          description="ابدأ بإنشاء محتوى جديد باستخدام الذكاء الاصطناعي"
        />
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

      {/* View Dialog with AI Features */}
      <ContentDetailDialog
        content={viewContent}
        onClose={() => setViewContent(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="هل أنت متأكد من الحذف؟"
        description="سيتم حذف هذا المحتوى نهائياً. لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        isPending={deleteContent.isPending}
      />
    </div>
  );
}
