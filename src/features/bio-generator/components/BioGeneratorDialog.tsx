import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGenerateBio } from '../hooks/use-bio-generator';
import { getErrorMessage } from '@/lib/api';
import { copyToClipboard } from '@/utils';
import type { Platform, BioVariation } from '../types';

const PLATFORMS: { value: Platform; label: string; maxChars: number }[] = [
  { value: 'X', label: 'X (تويتر)', maxChars: 160 },
  { value: 'Instagram', label: 'انستقرام', maxChars: 150 },
  { value: 'Facebook', label: 'فيسبوك', maxChars: 101 },
  { value: 'TikTok', label: 'تيك توك', maxChars: 80 },
];

const VARIATION_LABELS: Record<string, { ar: string; color: string }> = {
  short: { ar: 'قصير', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  medium: { ar: 'متوسط', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  professional: { ar: 'احترافي', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
};

interface BioGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function BioGeneratorDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
}: BioGeneratorDialogProps) {
  const [platform, setPlatform] = useState<Platform>('X');
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [variations, setVariations] = useState<BioVariation[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateBio = useGenerateBio();

  const handleGenerate = () => {
    setVariations([]);
    generateBio.mutate(
      {
        projectId,
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

  const selectedPlatform = PLATFORMS.find((p) => p.value === platform);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            مولد البايو الاحترافي
          </DialogTitle>
          <DialogDescription>
            أنشئ بايو احترافي لحساباتك على السوشال ميديا — مشروع: {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
            disabled={generateBio.isPending}
            className="w-full"
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

          {/* Results */}
          {variations.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm">
                النتائج — {selectedPlatform?.label}
              </h3>
              {variations.map((variation, index) => {
                const config = VARIATION_LABELS[variation.label] || {
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
