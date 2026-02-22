import React, { useState } from 'react';
import { X, Sparkles, Check, Copy, AlertCircle } from 'lucide-react';
import type { Platform } from '@/features/integrations';
import { PLATFORM_LABELS, PLATFORM_BADGE_COLORS } from '@/config/platform';
import { COPY_FEEDBACK_DURATION } from '@/config/constants';
import { useOptimizeForMultiplePlatforms } from '../hooks/use-optimization';
import type { OptimizationDialogProps, PlatformOptimizationResponse } from '../types';

const PLATFORMS: Platform[] = ['X', 'Facebook', 'Instagram', 'TikTok'];

export function OptimizationDialog({
  isOpen,
  onClose,
  originalText,
  hashtags = [],
  projectId,
  onOptimizationComplete,
}: OptimizationDialogProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['X', 'Instagram']);
  const [optimizations, setOptimizations] = useState<PlatformOptimizationResponse[]>([]);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);

  const optimizeMutation = useOptimizeForMultiplePlatforms();

  const handleOptimize = async () => {
    try {
      const result = await optimizeMutation.mutateAsync({
        ProjectId: projectId,
        OriginalText: originalText,
        Hashtags: hashtags,
        TargetPlatforms: selectedPlatforms,
        Language: 'ar',
      });

      setOptimizations(result.data.optimizations);
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  const handleCopy = async (platform: Platform, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), COPY_FEEDBACK_DURATION);
  };

  const handleUseOptimizations = () => {
    if (onOptimizationComplete && optimizations.length > 0) {
      const optimizedTexts: Record<string, string> = {};
      optimizations.forEach((opt) => {
        optimizedTexts[opt.platform] = opt.optimizedText;
      });
      onOptimizationComplete(optimizedTexts);
    }
    onClose();
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">تحسين المحتوى بالذكاء الاصطناعي</h2>
              <p className="text-sm text-gray-500">قم بتحسين النص للمنصات المختلفة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Original Text Display */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">النص الأصلي</h3>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-gray-900 whitespace-pre-wrap">{originalText}</p>
              {hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">اختر المنصات للتحسين</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`p-4 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedPlatforms.includes(platform)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {PLATFORM_LABELS[platform]}
                </button>
              ))}
            </div>
          </div>

          {/* Optimize Button */}
          {selectedPlatforms.length > 0 && optimizations.length === 0 && (
            <div className="mb-6">
              <button
                onClick={handleOptimize}
                disabled={optimizeMutation.isPending}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {optimizeMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    جاري التحسين...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    تحسين المحتوى للمنصات المحددة
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Error Display */}
          {optimizeMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">فشل في تحسين المحتوى</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                حدث خطأ أثناء محاولة تحسين المحتوى. يرجى المحاولة مرة أخرى.
              </p>
            </div>
          )}

          {/* Optimized Results */}
          {optimizations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">النتائج المحسنة</h3>
                <button
                  onClick={handleUseOptimizations}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  استخدام النتائج
                </button>
              </div>

              {optimizations.map((optimization) => (
                <div key={optimization.platform} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${PLATFORM_BADGE_COLORS[optimization.platform]}`}>
                        {PLATFORM_LABELS[optimization.platform]}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(optimization.platform, optimization.optimizedText)}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {copiedPlatform === optimization.platform ? (
                        <>
                          <Check className="w-3 h-3" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          نسخ
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-900 whitespace-pre-wrap">{optimization.optimizedText}</p>
                    </div>

                    {optimization.suggestedHashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الهاشتاجات المقترحة:</p>
                        <div className="flex flex-wrap gap-1">
                          {optimization.suggestedHashtags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {optimization.optimizationNotes && (
                      <div className="text-xs text-gray-600 bg-white rounded p-2 border">
                        <strong>ملاحظات التحسين:</strong> {optimization.optimizationNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}