import { useState } from 'react';
import { Sparkles, Hash, Repeat, Zap, Send } from 'lucide-react';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizationDialog, RepurposeDialog, HashtagAnalyzer, useCheckBrandVoice } from '@/features/content-optimization';
import { BrandScoreDisplay } from '@/features/content-optimization/components/BrandScoreDisplay';
import { CONTENT_STATUS_CONFIG } from '@/config/platform';
import { formatDate } from '@/utils';
import type { ContentItem } from '../types';

interface ContentDetailDialogProps {
  content: ContentItem | null;
  onClose: () => void;
}

export function ContentDetailDialog({ content, onClose }: ContentDetailDialogProps) {
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [showRepurposeDialog, setShowRepurposeDialog] = useState(false);
  const [showHashtagAnalyzer, setShowHashtagAnalyzer] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Store content data for child dialogs (needed when main dialog closes)
  const [savedContent, setSavedContent] = useState<ContentItem | null>(null);

  // Brand voice check
  const checkBrandVoice = useCheckBrandVoice();

  const handleCheckBrandVoice = () => {
    if (!displayContent) return;

    checkBrandVoice.mutate({
      ProjectId: displayContent.projectId,
      ContentText: displayContent.content,
      Language: 'ar',
    });
    setActiveTab('brand-voice');
  };

  const handleOpenSubDialog = (dialogSetter: (value: boolean) => void) => {
    if (content) {
      setSavedContent(content); // Save content before closing
    }
    onClose(); // Close main dialog first
    // Small delay to ensure smooth transition
    setTimeout(() => dialogSetter(true), 100);
  };

  const handleCloseSubDialog = (dialogSetter: (value: boolean) => void) => {
    dialogSetter(false);
    setSavedContent(null); // Clear saved content
  };

  if (!content && !savedContent) return null;

  const displayContent = content || savedContent!;

  return (
    <>
      <Dialog open={!!content} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <DialogTitle>{displayContent.title || 'عرض المحتوى'}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{CONTENT_STATUS_CONFIG[displayContent.status]?.label ?? displayContent.status}</Badge>
                  {displayContent.templateName && (
                    <Badge variant="secondary">{displayContent.templateName}</Badge>
                  )}
                  <span className="text-xs">
                    {formatDate(displayContent.createdAt)}
                  </span>
                </DialogDescription>
              </div>
              <Button
                variant="default"
                size="sm"
                asChild
                className="shrink-0"
              >
                <Link href={`/publish?contentId=${displayContent.id}&projectId=${displayContent.projectId}`}>
                  <Send className="h-4 w-4 ml-2" />
                  نشر
                </Link>
              </Button>
            </div>
          </DialogHeader>

          <Separator className="my-4" />

          {/* AI Features Action Buttons */}
          <div className="flex flex-wrap gap-2 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckBrandVoice}
              disabled={checkBrandVoice.isPending}
            >
              <Sparkles className="h-4 w-4 ml-2" />
              {checkBrandVoice.isPending ? 'جارٍ الفحص...' : 'فحص الهوية'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenSubDialog(setShowHashtagAnalyzer)}
            >
              <Hash className="h-4 w-4 ml-2" />
              تحليل الهاشتاقات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenSubDialog(setShowOptimizeDialog)}
            >
              <Zap className="h-4 w-4 ml-2" />
              تحسين
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenSubDialog(setShowRepurposeDialog)}
            >
              <Repeat className="h-4 w-4 ml-2" />
              إعادة توظيف
            </Button>
          </div>

          {/* Tabs for Content and Analysis */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="brand-voice" disabled={!checkBrandVoice.data}>
                تحليل الهوية
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 overflow-auto mt-4">
              <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                {displayContent.content}
              </div>
            </TabsContent>

            <TabsContent value="brand-voice" className="flex-1 overflow-auto mt-4">
              {checkBrandVoice.data?.data ? (
                <BrandScoreDisplay result={checkBrandVoice.data.data} />
              ) : checkBrandVoice.isError ? (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <Sparkles className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-destructive">لا يوجد Brand DNA للمشروع</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      يجب إنشاء Brand DNA أولاً لتحليل توافق المحتوى مع هوية علامتك التجارية
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/projects/${displayContent.projectId}/edit`}>
                      انتقل إلى المشروع لإنشاء Brand DNA
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p>اضغط على "فحص الهوية" لتحليل توافق المحتوى مع هوية علامتك التجارية</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Optimization Dialog */}
      {displayContent && (
        <>
          <OptimizationDialog
            isOpen={showOptimizeDialog}
            onClose={() => handleCloseSubDialog(setShowOptimizeDialog)}
            projectId={displayContent.projectId}
            originalText={displayContent.content}
            contentId={displayContent.id}
          />

          {/* Repurpose Dialog */}
          <RepurposeDialog
            isOpen={showRepurposeDialog}
            onClose={() => handleCloseSubDialog(setShowRepurposeDialog)}
            projectId={displayContent.projectId}
            originalText={displayContent.content}
            contentId={displayContent.id}
          />

          {/* Hashtag Analyzer */}
          <HashtagAnalyzer
            isOpen={showHashtagAnalyzer}
            onClose={() => handleCloseSubDialog(setShowHashtagAnalyzer)}
            projectId={displayContent.projectId}
            contentText={displayContent.content}
            contentId={displayContent.id}
          />
        </>
      )}
    </>
  );
}
