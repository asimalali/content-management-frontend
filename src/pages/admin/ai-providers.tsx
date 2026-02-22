import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  AlertCircle,
  Brain,
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  Key,
  Zap,
  ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import {
  useAiProviders,
  useUpdateAiProvider,
  useActivateTextProvider,
  useActivateImageProvider,
  useTestAiProvider,
} from '@/features/admin/hooks/use-admin-ai-providers';
import type {
  AiProviderConfiguration,
  AiProviderTestResult,
} from '@/features/admin/types';

const PROVIDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  openai: Bot,
  anthropic: Brain,
  gemini: Sparkles,
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'لم يتم الاختبار';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Edit Dialog Schema ---
const editProviderSchema = z.object({
  apiKey: z.string().optional(),
  defaultModel: z.string().min(1, 'اختر نموذجاً'),
  maxTokens: z.number().min(100, 'الحد الأدنى 100').max(16384, 'الحد الأقصى 16384'),
  temperature: z.number().min(0, 'الحد الأدنى 0').max(2, 'الحد الأقصى 2'),
  isEnabled: z.boolean(),
  imageModel: z.string().optional(),
});

type EditFormData = z.infer<typeof editProviderSchema>;

// --- Edit Dialog ---
function AiProviderEditDialog({
  provider,
  open,
  onOpenChange,
}: {
  provider: AiProviderConfiguration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateProvider = useUpdateAiProvider();

  const form = useForm<EditFormData>({
    resolver: zodResolver(editProviderSchema),
    values: provider
      ? {
          apiKey: '',
          defaultModel: provider.defaultModel,
          maxTokens: provider.maxTokens,
          temperature: provider.temperature,
          isEnabled: provider.isEnabled,
          imageModel: provider.imageModel ?? '',
        }
      : undefined,
  });

  const onSubmit = (data: EditFormData) => {
    if (!provider) return;

    updateProvider.mutate(
      {
        providerKey: provider.providerKey,
        data: {
          ...(data.apiKey ? { apiKey: data.apiKey } : {}),
          defaultModel: data.defaultModel,
          maxTokens: data.maxTokens,
          temperature: data.temperature,
          isEnabled: data.isEnabled,
          ...(provider.supportsImageGeneration && data.imageModel
            ? { imageModel: data.imageModel }
            : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success('تم تحديث الإعدادات بنجاح');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('فشل تحديث الإعدادات');
        },
      }
    );
  };

  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل إعدادات {provider.displayName}</DialogTitle>
          <DialogDescription>
            قم بتحديث إعدادات المزود. اترك مفتاح API فارغاً للإبقاء على المفتاح الحالي.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مفتاح API</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="أدخل مفتاح API جديد..."
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    اتركه فارغاً للإبقاء على المفتاح الحالي
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>النموذج الافتراضي</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {provider.availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحد الأقصى للتوكنات</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={100}
                        max={16384}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>درجة الحرارة</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {provider.supportsImageGeneration && (
              <FormField
                control={form.control}
                name="imageModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نموذج الصور</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: dall-e-3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">تفعيل المزود</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={updateProvider.isPending}>
                {updateProvider.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --- Provider Card ---
function AiProviderCard({
  provider,
  onEdit,
  onActivateText,
  onActivateImage,
  testResult,
  isTesting,
  isActivatingText,
  isActivatingImage,
  onTest,
}: {
  provider: AiProviderConfiguration;
  onEdit: (provider: AiProviderConfiguration) => void;
  onActivateText: (providerKey: string) => void;
  onActivateImage: (providerKey: string) => void;
  onTest: (providerKey: string) => void;
  testResult?: AiProviderTestResult | null;
  isTesting?: boolean;
  isActivatingText?: boolean;
  isActivatingImage?: boolean;
}) {
  const Icon = PROVIDER_ICONS[provider.providerKey] ?? Brain;

  const canActivateText = provider.isEnabled && provider.hasApiKey && !provider.isActive;
  const canActivateImage =
    provider.isEnabled &&
    provider.hasApiKey &&
    provider.supportsImageGeneration &&
    !provider.isActiveImageProvider;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon className="h-6 w-6" />
          <span className="flex-1">{provider.displayName}</span>
        </CardTitle>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant={provider.isEnabled ? 'default' : 'secondary'}>
            {provider.isEnabled ? 'مفعل' : 'معطل'}
          </Badge>
          {provider.isActive && (
            <Badge className="bg-blue-600 hover:bg-blue-700">
              <Zap className="ml-1 h-3 w-3" />
              مزود النصوص النشط
            </Badge>
          )}
          {provider.isActiveImageProvider && (
            <Badge className="bg-purple-600 hover:bg-purple-700">
              <ImageIcon className="ml-1 h-3 w-3" />
              مزود الصور النشط
            </Badge>
          )}
          <Badge variant={provider.hasApiKey ? 'outline' : 'destructive'}>
            <Key className="ml-1 h-3 w-3" />
            {provider.hasApiKey ? 'مفتاح API مُعَد' : 'غير مُعَد'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">النموذج الافتراضي:</span>
            <code className="text-xs">{provider.defaultModel}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الحد الأقصى للتوكنات:</span>
            <span>{provider.maxTokens.toLocaleString('ar-SA')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">درجة الحرارة:</span>
            <span>{provider.temperature}</span>
          </div>
          {provider.supportsImageGeneration && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">نموذج الصور:</span>
              <code className="text-xs">{provider.imageModel ?? '—'}</code>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">آخر اختبار:</span>
            <span className="text-xs">{formatDate(provider.lastTestedAt)}</span>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <Alert variant={testResult.success ? 'default' : 'destructive'}>
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {testResult.success
                ? testResult.responsePreview ?? 'الاتصال ناجح'
                : testResult.errorMessage ?? 'فشل الاتصال'}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(provider)}>
            تعديل الإعدادات
          </Button>

          {canActivateText && (
            <Button
              variant="outline"
              size="sm"
              disabled={isActivatingText}
              onClick={() => onActivateText(provider.providerKey)}
            >
              {isActivatingText && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
              تفعيل للنصوص
            </Button>
          )}

          {canActivateImage && (
            <Button
              variant="outline"
              size="sm"
              disabled={isActivatingImage}
              onClick={() => onActivateImage(provider.providerKey)}
            >
              {isActivatingImage && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
              تفعيل للصور
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={isTesting || !provider.hasApiKey}
            onClick={() => onTest(provider.providerKey)}
          >
            {isTesting ? (
              <Loader2 className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <Zap className="ml-1 h-3 w-3" />
            )}
            اختبار الاتصال
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Page ---
export default function AdminAiProvidersPage() {
  const { data: providers, isLoading, error } = useAiProviders();
  const activateText = useActivateTextProvider();
  const activateImage = useActivateImageProvider();
  const testProvider = useTestAiProvider();

  const [editingProvider, setEditingProvider] = useState<AiProviderConfiguration | null>(null);
  const [testResults, setTestResults] = useState<Record<string, AiProviderTestResult>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'text' | 'image';
    providerKey: string;
    displayName: string;
  } | null>(null);

  const handleActivateText = (providerKey: string) => {
    const provider = providers?.find((p) => p.providerKey === providerKey);
    if (!provider) return;
    setConfirmAction({ type: 'text', providerKey, displayName: provider.displayName });
  };

  const handleActivateImage = (providerKey: string) => {
    const provider = providers?.find((p) => p.providerKey === providerKey);
    if (!provider) return;
    setConfirmAction({ type: 'image', providerKey, displayName: provider.displayName });
  };

  const handleConfirmActivation = () => {
    if (!confirmAction) return;

    const mutation = confirmAction.type === 'text' ? activateText : activateImage;
    const label = confirmAction.type === 'text' ? 'النصوص' : 'الصور';

    mutation.mutate(confirmAction.providerKey, {
      onSuccess: () => {
        toast.success(`تم تفعيل ${confirmAction.displayName} كمزود ${label}`);
        setConfirmAction(null);
      },
      onError: () => {
        toast.error(`فشل تفعيل المزود`);
        setConfirmAction(null);
      },
    });
  };

  const handleTest = (providerKey: string) => {
    setTestingKey(providerKey);
    testProvider.mutate(providerKey, {
      onSuccess: (response) => {
        setTestResults((prev) => ({ ...prev, [providerKey]: response.data }));
        setTestingKey(null);
        if (response.data.success) {
          toast.success('الاتصال ناجح');
        } else {
          toast.error(response.data.errorMessage ?? 'فشل الاتصال');
        }
      },
      onError: () => {
        setTestingKey(null);
        toast.error('فشل اختبار الاتصال');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">فشل تحميل إعدادات مزودي الذكاء الاصطناعي</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">مزودي الذكاء الاصطناعي</h1>
        <p className="text-muted-foreground">
          إدارة وتهيئة مزودي خدمة الذكاء الاصطناعي للنصوص والصور
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers?.map((provider) => (
          <AiProviderCard
            key={provider.id}
            provider={provider}
            onEdit={setEditingProvider}
            onActivateText={handleActivateText}
            onActivateImage={handleActivateImage}
            onTest={handleTest}
            testResult={testResults[provider.providerKey]}
            isTesting={testingKey === provider.providerKey}
            isActivatingText={activateText.isPending}
            isActivatingImage={activateImage.isPending}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <AiProviderEditDialog
        provider={editingProvider}
        open={!!editingProvider}
        onOpenChange={(open) => {
          if (!open) setEditingProvider(null);
        }}
      />

      {/* Confirm Activation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد التفعيل</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'text'
                ? `سيتم تفعيل ${confirmAction?.displayName} كمزود النصوص النشط. سيتم إلغاء تفعيل المزود الحالي تلقائياً.`
                : `سيتم تفعيل ${confirmAction?.displayName} كمزود الصور النشط. سيتم إلغاء تفعيل المزود الحالي تلقائياً.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmActivation}
              disabled={activateText.isPending || activateImage.isPending}
            >
              {(activateText.isPending || activateImage.isPending) && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
