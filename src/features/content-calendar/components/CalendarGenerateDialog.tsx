import { useState } from 'react';
import { X, CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { useGenerateCalendar } from '../hooks/use-calendar';
import type { CalendarDuration } from '../types';
import type { Platform } from '@/features/integrations';

interface CalendarGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onGenerated?: () => void;
}

const platformOptions: { value: Platform; label: string }[] = [
  { value: 'X', label: 'X (تويتر)' },
  { value: 'Instagram', label: 'انستقرام' },
];

export function CalendarGenerateDialog({
  isOpen,
  onClose,
  projectId,
  onGenerated,
}: CalendarGenerateDialogProps) {
  const [duration, setDuration] = useState<CalendarDuration>('Weekly');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(['X']));
  const generateMutation = useGenerateCalendar();

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        if (next.size > 1) next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  const creditCost = duration === 'Weekly' ? 5 : 10;

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({
        projectId,
        duration,
        targetPlatforms: Array.from(selectedPlatforms),
        language: 'ar',
      });
      onGenerated?.();
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">إنشاء تقويم محتوى</h2>
              <p className="text-xs text-gray-500">إنشاء خطة محتوى بالذكاء الاصطناعي</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Duration Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المدة</label>
            <div className="flex gap-2">
              {([['Weekly', 'أسبوعي (7 أيام)'], ['Monthly', 'شهري (30 يوم)']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setDuration(val as CalendarDuration)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
                    duration === val
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنصات المستهدفة</label>
            <div className="flex gap-2">
              {platformOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => togglePlatform(opt.value)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
                    selectedPlatforms.has(opt.value)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Credit Cost Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              التكلفة: <span className="font-semibold">{creditCost} رصيد</span>
            </p>
          </div>

          {/* Error State */}
          {generateMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">فشل في إنشاء التقويم</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                حدث خطأ أثناء الإنشاء. تأكد من وجود اشتراك فعال وأن حد الاستخدام لم يُستنفد.
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <CalendarDays className="w-4 h-4" />
                إنشاء التقويم
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
