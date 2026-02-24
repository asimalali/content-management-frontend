import { useState } from 'react';
import { toast } from 'sonner';
import {
  Copy,
  Check,
  Sparkles,
  Loader2,
  UserPen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { useProjects } from '@/features/projects';
import { useGenerateBio } from '@/features/bio-generator';
import type { Platform, BioVariation } from '@/features/bio-generator';
import { getErrorMessage } from '@/lib/api';
import { copyToClipboard } from '@/utils';

const PLATFORMS: { value: Platform; label: string; maxChars: number }[] = [
  { value: 'X', label: 'X (تويتر)', maxChars: 160 },
  { value: 'Instagram', label: 'انستقرام', maxChars: 150 },
  { value: 'Facebook', label: 'فيسبوك', maxChars: 101 },
  { value: 'TikTok', label: 'تيك توك', maxChars: 80 },
];

const VARIATION_STYLES: Record<string, { ar: string; color: string }> = {
  short: { ar: 'قصير', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  medium: { ar: 'متوسط', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  professional: { ar: 'احترافي', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
};

export default function BioGeneratorPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>('X');
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [variations, setVariations] = useState<BioVariation[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const generateBio = useGenerateBio();

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);
  const selectedPlatform = PLATFORMS.find((p) => p.value === platform);

  const handleGenerate = () => {
    if (!selectedProjectId) {
      toast.error('يرجى اختيار المشروع أولاً');
      return;
    }

    setVariations([]);
    generateBio.mutate(
      {
        projectId: selectedProjectId,
        targetPlatform: platform,
        language,
        additionalInstructions: additionalInstructions.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setVariations(data.variations);
          toast.success(`تم إنشاء ${data.variations.length} نسخ بايو بنجاح`);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleCopy = async (bio: string, index: number) => {
    await copyToClipboard(bio, () => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
    toast.success('تم النسخ');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="مولّد البايو الاحترافي"
        description="أنشئ بايو احترافي لحساباتك على السوشال ميديا باستخدام الذكاء الاصطناعي"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              إعدادات التوليد
            </CardTitle>
            <CardDescription>
              اختر المشروع والمنصة لإنشاء بايو مخصص بناءً على هوية علامتك التجارية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project Selector */}
            <div className="space-y-2">
              <Label>المشروع</Label>
              {isLoadingProjects ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Platform Select */}
            <div className="space-y-2">
              <Label>المنصة</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} (حد {p.maxChars} حرف)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Select */}
            <div className="space-y-2">
              <Label>اللغة</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'ar')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">عربي</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Instructions */}
            <div className="space-y-2">
              <Label>تعليمات إضافية (اختياري)</Label>
              <Textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="مثال: ركز على التجارة الإلكترونية، أضف رقم الواتساب..."
                className="min-h-20"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generateBio.isPending || !selectedProjectId}
              className="w-full"
              size="lg"
            >
              {generateBio.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جارٍ الإنشاء...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 ml-2" />
                  إنشاء البايو (1 كريدت)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">النتائج</CardTitle>
            <CardDescription>
              {selectedProject
                ? `بايو مشروع "${selectedProject.name}" — ${selectedPlatform?.label ?? ''}`
                : 'اختر مشروعاً وانقر "إنشاء البايو" لرؤية النتائج'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {variations.length === 0 ? (
              <EmptyState
                icon={UserPen}
                title={generateBio.isPending ? 'جارٍ الإنشاء...' : 'لا توجد نتائج بعد'}
                description={
                  generateBio.isPending
                    ? 'يتم تحليل هوية علامتك التجارية وإنشاء البايو المناسب'
                    : 'اختر المشروع والمنصة ثم انقر "إنشاء البايو" للحصول على 3 نسخ احترافية'
                }
              />
            ) : (
              <div className="space-y-3">
                {variations.map((variation, index) => {
                  const config = VARIATION_STYLES[variation.label] || {
                    ar: variation.label,
                    color: 'bg-gray-100 text-gray-800',
                  };
                  const isCopied = copiedIndex === index;

                  return (
                    <div
                      key={index}
                      className="rounded-lg border p-4 space-y-2 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className={config.color}>{config.ar}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {variation.characterCount} حرف
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed" dir="auto">
                        {variation.bio}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(variation.bio, index)}
                        className="gap-1"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            نسخ
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
