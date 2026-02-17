import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, SkipForward, Eye, X } from 'lucide-react';
import { useGenerateEntryContent, useUpdateEntry } from '../hooks/use-calendar';
import type { CalendarEntry } from '../types';
import { formatDateObject, copyToClipboard } from '@/utils';
import { toast } from 'sonner';

interface CalendarEntryCardProps {
  entry: CalendarEntry;
  onViewContent?: (entry: CalendarEntry) => void;
}

const platformLabels: Record<string, string> = {
  X: 'X',
  Instagram: 'انستقرام',
  Facebook: 'فيسبوك',
  TikTok: 'تيك توك',
};

const statusConfig: Record<string, { label: string; bg: string }> = {
  Idea: { label: 'فكرة', bg: 'bg-gray-100 text-gray-700' },
  ContentGenerated: { label: 'تم إنشاء المحتوى', bg: 'bg-green-100 text-green-700' },
  Published: { label: 'تم النشر', bg: 'bg-blue-100 text-blue-700' },
  Skipped: { label: 'تم التخطي', bg: 'bg-yellow-100 text-yellow-700' },
};

export function CalendarEntryCard({ entry, onViewContent }: CalendarEntryCardProps) {
  const [copied, setCopied] = useState(false);
  const generateMutation = useGenerateEntryContent();
  const updateMutation = useUpdateEntry();

  const statusInfo = statusConfig[entry.status] || statusConfig.Idea;
  const date = new Date(entry.scheduledDate);
  const dayName = formatDateObject(date, { weekday: 'long' });
  const dateStr = formatDateObject(date, { month: 'short', day: 'numeric' });

  const handleGenerateContent = async () => {
    try {
      await generateMutation.mutateAsync(entry.id);
      toast.success('تم إنشاء المحتوى بنجاح');
    } catch {
      toast.error('فشل في إنشاء المحتوى');
    }
  };

  const handleSkip = async () => {
    const newStatus = entry.status === 'Skipped' ? 'Idea' : 'Skipped';
    try {
      await updateMutation.mutateAsync({
        entryId: entry.id,
        request: { status: newStatus },
      });
    } catch {
      toast.error('فشل في تحديث الحالة');
    }
  };

  const handleCopyContent = async () => {
    if (!entry.generatedContent) return;
    const hashtagsText = entry.suggestedHashtags?.map((h) => `#${h}`).join(' ') || '';
    const fullText = `${entry.generatedContent}\n\n${hashtagsText}`.trim();
    await copyToClipboard(fullText, setCopied);
    toast.success('تم نسخ المحتوى');
  };

  return (
    <div className={`p-4 bg-white border rounded-lg transition-all ${entry.status === 'Skipped' ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Date & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-gray-500">
              {dayName} - {dateStr}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bg}`}>
              {statusInfo.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {platformLabels[entry.targetPlatform] || entry.targetPlatform}
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">{entry.topicTitle}</h4>
          <p className="text-xs text-gray-500 line-clamp-2">{entry.topicDescription}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {entry.status === 'Idea' && (
            <button
              onClick={handleGenerateContent}
              disabled={generateMutation.isPending}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="إنشاء محتوى"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          )}

          {entry.generatedContent && (
            <>
              <button
                onClick={() => onViewContent?.(entry)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="عرض المحتوى"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyContent}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="نسخ المحتوى"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </>
          )}

          <button
            onClick={handleSkip}
            disabled={updateMutation.isPending}
            className={`p-2 rounded-lg transition-colors ${
              entry.status === 'Skipped'
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={entry.status === 'Skipped' ? 'إلغاء التخطي' : 'تخطي'}
          >
            {entry.status === 'Skipped' ? <X className="w-4 h-4" /> : <SkipForward className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
