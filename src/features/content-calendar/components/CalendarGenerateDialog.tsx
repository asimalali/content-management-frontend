import { useEffect, useState } from 'react';
import { X, CalendarDays, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useGenerateCalendar } from '../hooks/use-calendar';
import type { AutoScheduleMode, CalendarDuration } from '../types';
import type { Platform } from '@/features/integrations';
import { useFeatureFlag } from '@/features/config/hooks/use-feature-flag';
import { usePlanFeature } from '@/features/subscriptions';
import { useProducts } from '@/features/product-catalog';
import { useCampaignPlaybooks } from '@/features/campaign-playbooks';
import type { ContentGoal, ContentLanguageMode } from '@/features/content';
import { Checkbox } from '@/components/ui/checkbox';

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

const noPlaybookValue = 'none';

export function CalendarGenerateDialog({
  isOpen,
  onClose,
  projectId,
  onGenerated,
}: CalendarGenerateDialogProps) {
  const [duration, setDuration] = useState<CalendarDuration>('Weekly');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(['X']));
  const [selectedPlaybookId, setSelectedPlaybookId] = useState(noPlaybookValue);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [goal, setGoal] = useState<ContentGoal>('Engagement');
  const [languageMode, setLanguageMode] = useState<ContentLanguageMode>('Arabic');
  const [autoScheduleMode, setAutoScheduleMode] = useState<AutoScheduleMode>('None');

  const generateMutation = useGenerateCalendar();
  const { isEnabled: businessContextEnabled } = useFeatureFlag('business_context_generation');
  const { isEnabled: playbooksEnabled } = useFeatureFlag('campaign_playbooks');
  const { isEnabled: analyticsWorkspaceEnabled } = useFeatureFlag('analytics_workspace');
  const { hasFeature: analyticsFeatureEnabled } = usePlanFeature('analytics');
  const { data: products } = useProducts(projectId || undefined);
  const { data: playbooks } = useCampaignPlaybooks(playbooksEnabled);

  const selectedPlaybook = (playbooks || []).find((playbook) => playbook.id === selectedPlaybookId);
  const analyticsSchedulingEnabled = analyticsWorkspaceEnabled && analyticsFeatureEnabled;

  useEffect(() => {
    if (!selectedPlaybook) return;

    setDuration(selectedPlaybook.defaultDuration);
    setSelectedPlatforms(new Set(selectedPlaybook.defaultPlatforms));
  }, [selectedPlaybook]);

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

  const toggleProduct = (productId: string, checked: boolean) => {
    setSelectedProductIds((prev) => (
      checked
        ? [...prev, productId]
        : prev.filter((id) => id !== productId)
    ));
  };

  const creditCost = duration === 'Weekly' ? 5 : 10;

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({
        projectId,
        duration,
        targetPlatforms: Array.from(selectedPlatforms),
        language: languageMode === 'Arabic' ? 'ar' : languageMode === 'English' ? 'en' : 'both',
        playbookId: selectedPlaybookId !== noPlaybookValue ? selectedPlaybookId : undefined,
        productIds: businessContextEnabled ? selectedProductIds : undefined,
        goal: businessContextEnabled ? goal : undefined,
        languageMode: businessContextEnabled ? languageMode : undefined,
        autoScheduleMode: analyticsSchedulingEnabled ? autoScheduleMode : 'None',
      });
      onGenerated?.();
      onClose();
    } catch {
      // handled by mutation state
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">إنشاء تقويم محتوى</h2>
              <p className="text-xs text-gray-500">خطة محتوى مدعومة بالذكاء الاصطناعي وسياق العمل</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {playbooksEnabled && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">الحملة الجاهزة</label>
              <select
                value={selectedPlaybookId}
                onChange={(event) => setSelectedPlaybookId(event.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
              >
                <option value={noPlaybookValue}>بدون حملة جاهزة</option>
                {(playbooks || []).map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>
                    {playbook.titleAr}
                  </option>
                ))}
              </select>
              {selectedPlaybook && (
                <p className="mt-2 text-xs text-gray-500">{selectedPlaybook.descriptionAr}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">المدة</label>
            <div className="flex gap-2">
              {([['Weekly', 'أسبوعي (7 أيام)'], ['Monthly', 'شهري (30 يوم)']] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setDuration(value)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    duration === value
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">المنصات المستهدفة</label>
            <div className="flex gap-2">
              {platformOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => togglePlatform(option.value)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    selectedPlatforms.has(option.value)
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {businessContextEnabled && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">هدف الحملة</label>
                <select
                  value={goal}
                  onChange={(event) => setGoal(event.target.value as ContentGoal)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                >
                  <option value="Awareness">زيادة الوعي</option>
                  <option value="Engagement">رفع التفاعل</option>
                  <option value="Conversion">تحويل ومبيعات</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">وضع اللغة</label>
                <select
                  value={languageMode}
                  onChange={(event) => setLanguageMode(event.target.value as ContentLanguageMode)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                >
                  <option value="Arabic">العربية</option>
                  <option value="English">English</option>
                  <option value="Bilingual">ثنائي اللغة</option>
                </select>
              </div>
            </div>
          )}

          {businessContextEnabled && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">المنتجات / الخدمات</label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                {(products || []).filter((product) => product.isActive).length ? (
                  (products || [])
                    .filter((product) => product.isActive)
                    .map((product) => (
                      <label key={product.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-gray-50">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(value) => toggleProduct(product.id, Boolean(value))}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.nameAr || product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.uniqueSellingPoint || product.descriptionAr || product.description}
                          </div>
                        </div>
                      </label>
                    ))
                ) : (
                  <div className="text-sm text-gray-500">لا توجد منتجات نشطة لهذا المشروع.</div>
                )}
              </div>
            </div>
          )}

          {analyticsSchedulingEnabled && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">التوقيت التلقائي</label>
              <div className="flex gap-2">
                {([['None', 'افتراضي'], ['BestTime', 'أفضل وقت']] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setAutoScheduleMode(value)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      autoScheduleMode === value
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="text-sm text-blue-700">
              التكلفة: <span className="font-semibold">{creditCost} رصيد</span>
            </div>
            {selectedPlaybook && (
              <div className="mt-1 text-xs text-blue-600">
                سيتم تطبيق إعدادات الحملة الجاهزة على الموضوعات وتوزيع المنصات.
              </div>
            )}
          </div>

          {generateMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">فشل في إنشاء التقويم</span>
              </div>
              <p className="mt-1 text-sm text-red-600">
                حدث خطأ أثناء الإنشاء. تأكد من وجود اشتراك فعال وحد استخدام متاح.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                إنشاء التقويم
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
