import { useState } from 'react';
import { X, Copy, Check, Hash } from 'lucide-react';
import type { CalendarEntry } from '../types';
import { formatDateObject, copyToClipboard } from '@/utils';
import { PLATFORM_LABELS_AR } from '@/config/platform';
import { toast } from 'sonner';

interface EntryContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: CalendarEntry | null;
}

export function EntryContentDialog({ isOpen, onClose, entry }: EntryContentDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !entry) return null;

  const handleCopy = async () => {
    const hashtagsText = entry.suggestedHashtags?.map((h) => `#${h}`).join(' ') || '';
    const fullText = `${entry.generatedContent || ''}\n\n${hashtagsText}`.trim();
    await copyToClipboard(fullText, setCopied);
    toast.success('تم نسخ المحتوى');
  };

  const date = new Date(entry.scheduledDate);
  const dateStr = formatDateObject(date, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{entry.topicTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{dateStr}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {PLATFORM_LABELS_AR[entry.targetPlatform] || entry.targetPlatform}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
          {/* Content */}
          {entry.generatedContent && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">المحتوى</h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {entry.generatedContent}
                </p>
              </div>
            </div>
          )}

          {/* Hashtags */}
          {entry.suggestedHashtags && entry.suggestedHashtags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-medium text-gray-700">الهاشتاقات المقترحة</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.suggestedHashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-sm bg-violet-50 border border-violet-200 text-violet-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'تم النسخ' : 'نسخ المحتوى مع الهاشتاقات'}
          </button>
        </div>
      </div>
    </div>
  );
}
