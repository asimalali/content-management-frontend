import { useState } from 'react';
import { Link } from 'wouter';
import { X, Repeat2, Check, Copy, AlertCircle, Send } from 'lucide-react';
import type { Platform } from '@/features/integrations';
import { useRepurposeContent } from '../hooks/use-optimization';
import type { RepurposeDialogProps, RepurposedVariant } from '../types';

const PLATFORMS: Platform[] = ['X', 'Instagram'];

const platformLabels: Record<Platform, string> = {
  X: 'X (Twitter)',
  Facebook: 'Facebook',
  Instagram: 'Instagram',
  TikTok: 'TikTok',
};

const platformColors: Record<Platform, string> = {
  X: 'bg-slate-900 text-white',
  Facebook: 'bg-blue-600 text-white',
  Instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white',
  TikTok: 'bg-black text-white',
};

export function RepurposeDialog({
  isOpen,
  onClose,
  contentId,
  originalText,
  projectId,
}: RepurposeDialogProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['X', 'Instagram']);
  const [variants, setVariants] = useState<RepurposedVariant[]>([]);
  const [activeTab, setActiveTab] = useState<Platform | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);

  const repurposeMutation = useRepurposeContent();

  const handleRepurpose = async () => {
    if (!contentId) return;

    try {
      const result = await repurposeMutation.mutateAsync({
        ContentId: contentId,
        ProjectId: projectId,
        TargetPlatforms: selectedPlatforms,
        Language: 'ar',
      });

      setVariants(result.data.variants);
      if (result.data.variants.length > 0) {
        setActiveTab(result.data.variants[0].platform);
      }
    } catch (error) {
      console.error('Repurposing failed:', error);
    }
  };

  const handleCopy = async (platform: Platform, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleClose = () => {
    setVariants([]);
    setActiveTab(null);
    onClose();
  };

  if (!isOpen) return null;

  const activeVariant = variants.find((v) => v.platform === activeTab);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Repeat2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">تحويل المحتوى</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">حوّل المحتوى إلى صيغ مختلفة لكل منصة</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Original Text Display */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">النص الأصلي</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap line-clamp-6">{originalText}</p>
            </div>
          </div>

          {/* Platform Selection - before results */}
          {variants.length === 0 && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">اختر المنصات للتحويل</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`p-4 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedPlatforms.includes(platform)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      {platformLabels[platform]}
                    </button>
                  ))}
                </div>
                {selectedPlatforms.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    التكلفة: {selectedPlatforms.length} وحدة
                  </p>
                )}
              </div>

              {/* Repurpose Button */}
              {selectedPlatforms.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={handleRepurpose}
                    disabled={repurposeMutation.isPending}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {repurposeMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        جاري التحويل...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Repeat2 className="w-4 h-4" />
                        تحويل المحتوى ({selectedPlatforms.length} منصة)
                      </span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Error Display */}
          {repurposeMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">فشل في تحويل المحتوى</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                حدث خطأ أثناء محاولة تحويل المحتوى. يرجى المحاولة مرة أخرى.
              </p>
            </div>
          )}

          {/* Repurposed Results - Tabbed View */}
          {variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">النتائج المحوّلة</h3>

              {/* Platform Tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                {variants.map((variant) => (
                  <button
                    key={variant.platform}
                    onClick={() => setActiveTab(variant.platform)}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                      activeTab === variant.platform
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs mr-2 ${platformColors[variant.platform]}`}>
                      {platformLabels[variant.platform]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Variant Content */}
              {activeVariant && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <button
                      onClick={() => handleCopy(activeVariant.platform, activeVariant.content)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {copiedPlatform === activeVariant.platform ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          نسخ
                        </>
                      )}
                    </button>
                    <Link
                      href={`/publish?text=${encodeURIComponent(activeVariant.content)}&projectId=${projectId}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      نشر
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{activeVariant.content}</p>

                    {/* Hashtags */}
                    {activeVariant.suggestedHashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الهاشتاجات المقترحة:</p>
                        <div className="flex flex-wrap gap-1">
                          {activeVariant.suggestedHashtags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Adaptation Notes */}
                    {activeVariant.adaptationNotes && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 rounded p-2 border dark:border-gray-700">
                        <strong>ملاحظات التحويل:</strong> {activeVariant.adaptationNotes}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
