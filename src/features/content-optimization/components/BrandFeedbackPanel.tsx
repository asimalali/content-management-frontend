import { X, ShieldCheck, RefreshCw, Lightbulb, AlertCircle } from 'lucide-react';
import { BrandScoreBadge } from './BrandScoreBadge';
import { useCheckBrandVoice } from '../hooks/use-optimization';
import type { BrandFeedbackPanelProps, BrandConsistencyResponse } from '../types';
import { useState } from 'react';

const aspectLabels: Record<string, string> = {
  tone: 'النبرة',
  vocabulary: 'المفردات',
  audienceAlignment: 'توافق الجمهور',
};

function getBarColor(score: number) {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function BrandFeedbackPanel({
  isOpen,
  onClose,
  contentText,
  projectId,
  language = 'ar',
}: BrandFeedbackPanelProps) {
  const [result, setResult] = useState<BrandConsistencyResponse | null>(null);
  const checkMutation = useCheckBrandVoice();

  const handleCheck = async () => {
    try {
      const response = await checkMutation.mutateAsync({
        ProjectId: projectId!,
        ContentText: contentText!,
        Language: language,
      });
      setResult(response.data);
    } catch {
      // Error state handled by mutation
    }
  };

  const handleRecheck = () => {
    setResult(null);
    handleCheck();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">فحص توافق الهوية</h2>
              <p className="text-xs text-gray-500">تحليل مدى توافق المحتوى مع هوية العلامة التجارية</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Initial state - no result yet */}
          {!result && !checkMutation.isPending && !checkMutation.isError && (
            <div className="text-center py-8">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">تحقق من مدى توافق المحتوى مع هوية علامتك التجارية</p>
              <button
                onClick={handleCheck}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  بدء الفحص
                </span>
              </button>
            </div>
          )}

          {/* Loading state */}
          {checkMutation.isPending && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري تحليل المحتوى...</p>
            </div>
          )}

          {/* Error state */}
          {checkMutation.isError && !result && (
            <div className="py-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">فشل في تحليل المحتوى</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  حدث خطأ أثناء التحليل. تأكد من وجود هوية العلامة التجارية (Brand DNA) للمشروع.
                </p>
              </div>
              <button
                onClick={handleCheck}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5">
              {/* Overall Score */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border">
                <div>
                  <p className="text-sm font-medium text-gray-700">النتيجة الإجمالية</p>
                  <p className="text-xs text-gray-500 mt-1">مدى توافق المحتوى مع الهوية</p>
                </div>
                <BrandScoreBadge score={result.overallScore} size="lg" showLabel />
              </div>

              {/* Aspect Scores */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">التحليل التفصيلي</h3>
                <div className="space-y-3">
                  {Object.entries(result.aspectScores).map(([key, score]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{aspectLabels[key] || key}</span>
                        <span className="text-sm font-medium text-gray-900">{score}/100</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {result.feedback.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">الملاحظات</h3>
                  <ul className="space-y-2">
                    {result.feedback.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">اقتراحات التحسين</h3>
                  <ul className="space-y-2">
                    {result.suggestions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-check Button */}
              <button
                onClick={handleRecheck}
                disabled={checkMutation.isPending}
                className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${checkMutation.isPending ? 'animate-spin' : ''}`} />
                إعادة الفحص
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
