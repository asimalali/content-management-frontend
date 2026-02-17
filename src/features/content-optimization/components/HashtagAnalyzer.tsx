import { useState } from 'react';
import { X, Hash, RefreshCw, AlertCircle, Copy, Check, Clipboard } from 'lucide-react';
import { useAnalyzeHashtags } from '../hooks/use-optimization';
import type { HashtagAnalyzerProps, HashtagAnalysisResponse, HashtagSuggestion } from '../types';
import type { Platform } from '@/features/integrations';

const platformOptions: { value: Platform; label: string }[] = [
  { value: 'X', label: 'X (تويتر)' },
  { value: 'Instagram', label: 'انستقرام' },
];

const categoryConfig = {
  reach: {
    label: 'وصول عالي',
    description: 'هاشتاقات ذات حجم كبير لأقصى وصول',
    chipBg: 'bg-green-50 border-green-200 text-green-800',
    selectedBg: 'bg-green-500 border-green-500 text-white',
    dotColor: 'bg-green-500',
  },
  targeted: {
    label: 'مستهدفة',
    description: 'هاشتاقات متخصصة في المجال',
    chipBg: 'bg-blue-50 border-blue-200 text-blue-800',
    selectedBg: 'bg-blue-500 border-blue-500 text-white',
    dotColor: 'bg-blue-500',
  },
  niche: {
    label: 'مجتمعية',
    description: 'هاشتاقات خاصة بالعلامة والمجتمع',
    chipBg: 'bg-purple-50 border-purple-200 text-purple-800',
    selectedBg: 'bg-purple-500 border-purple-500 text-white',
    dotColor: 'bg-purple-500',
  },
};

export function HashtagAnalyzer({
  isOpen,
  onClose,
  contentText,
  projectId,
  onHashtagsSelected,
}: HashtagAnalyzerProps) {
  const [platform, setPlatform] = useState<Platform>('X');
  const [result, setResult] = useState<HashtagAnalysisResponse | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const analyzeMutation = useAnalyzeHashtags();

  const handleAnalyze = async () => {
    try {
      const response = await analyzeMutation.mutateAsync({
        ProjectId: projectId,
        ContentText: contentText,
        TargetPlatform: platform,
        Language: 'ar',
      });
      setResult(response.data);
      // Select all hashtags by default
      const allTags = [
        ...response.data.reach,
        ...response.data.targeted,
        ...response.data.niche,
      ].map((h) => h.tag);
      setSelectedTags(new Set(allTags));
    } catch {
      // Error handled by mutation
    }
  };

  const handleReanalyze = () => {
    setResult(null);
    setSelectedTags(new Set());
    handleAnalyze();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleUseSelected = () => {
    if (onHashtagsSelected) {
      onHashtagsSelected(Array.from(selectedTags));
    }
    onClose();
  };

  const handleCopyAll = () => {
    const allTags = Array.from(selectedTags)
      .map((t) => `#${t}`)
      .join(' ');
    navigator.clipboard.writeText(allTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const totalSelected = selectedTags.size;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">تحليل الهاشتاقات</h2>
              <p className="text-xs text-gray-500">اقتراحات هاشتاقات ذكية مصنفة حسب الاستراتيجية</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Platform Selector */}
          {!result && !analyzeMutation.isPending && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">المنصة المستهدفة</label>
              <div className="flex gap-2">
                {platformOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPlatform(opt.value)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
                      platform === opt.value
                        ? 'bg-violet-50 border-violet-300 text-violet-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Initial state */}
          {!result && !analyzeMutation.isPending && !analyzeMutation.isError && (
            <div className="text-center py-6">
              <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">تحليل المحتوى واقتراح هاشتاقات مناسبة للمنصة</p>
              <button
                onClick={handleAnalyze}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <Hash className="w-4 h-4" />
                  تحليل الهاشتاقات
                </span>
              </button>
            </div>
          )}

          {/* Loading state */}
          {analyzeMutation.isPending && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري تحليل المحتوى واقتراح الهاشتاقات...</p>
            </div>
          )}

          {/* Error state */}
          {analyzeMutation.isError && !result && (
            <div className="py-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">فشل في تحليل الهاشتاقات</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  حدث خطأ أثناء التحليل. تأكد من وجود اشتراك فعال وأن حد الاستخدام لم يُستنفد.
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5">
              {/* Hashtag Categories */}
              {(['reach', 'targeted', 'niche'] as const).map((category) => {
                const config = categoryConfig[category];
                const hashtags: HashtagSuggestion[] = result[category];
                if (!hashtags || hashtags.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                      <h3 className="text-sm font-medium text-gray-700">{config.label}</h3>
                      <span className="text-xs text-gray-400">— {config.description}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((h) => {
                        const isSelected = selectedTags.has(h.tag);
                        return (
                          <button
                            key={h.tag}
                            onClick={() => toggleTag(h.tag)}
                            title={h.reason}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all cursor-pointer ${
                              isSelected ? config.selectedBg : config.chipBg
                            }`}
                          >
                            #{h.tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Strategy Notes */}
              {result.strategyNotes && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">ملاحظات الاستراتيجية</h3>
                  <p className="text-sm text-gray-600">{result.strategyNotes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {onHashtagsSelected && (
                  <button
                    onClick={handleUseSelected}
                    disabled={totalSelected === 0}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg hover:from-violet-600 hover:to-purple-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Clipboard className="w-4 h-4" />
                    استخدام المحدد ({totalSelected})
                  </button>
                )}
                <button
                  onClick={handleCopyAll}
                  disabled={totalSelected === 0}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'تم النسخ' : 'نسخ المحدد'}
                </button>
              </div>

              {/* Re-analyze Button */}
              <button
                onClick={handleReanalyze}
                disabled={analyzeMutation.isPending}
                className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
                إعادة التحليل
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
