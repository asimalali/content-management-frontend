import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ImageIcon, AlertCircle, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjects } from '@/features/projects';
import { useGenerateImage, type ImageGenerationResponse } from '@/features/content';
import { useCreditBalance } from '@/features/credits';
import { toast } from 'sonner';
import { LOW_CREDIT_THRESHOLD, IMAGE_GENERATION_CREDIT_COST } from '@/config/constants';
import { copyToClipboard } from '@/utils';

const formSchema = z.object({
  projectId: z.string().min(1, 'اختر مشروعاً'),
  prompt: z.string().min(1, 'أدخل وصف الصورة').max(4000, 'الحد الأقصى 4000 حرف'),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']),
  quality: z.enum(['standard', 'hd']),
  style: z.enum(['natural', 'vivid']),
});

type FormData = z.infer<typeof formSchema>;

export default function ImageGeneratePage() {
  const [result, setResult] = useState<ImageGenerationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();
  const generateImage = useGenerateImage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: '',
      prompt: '',
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    },
  });

  const onSubmit = (data: FormData) => {
    if (creditBalance && creditBalance.available < IMAGE_GENERATION_CREDIT_COST) {
      toast.error('رصيد الوحدات غير كافٍ');
      return;
    }

    generateImage.mutate(data, {
      onSuccess: (response) => {
        setResult(response);
        toast.success('تم إنشاء الصورة بنجاح');
      },
      onError: () => {
        toast.error('فشل إنشاء الصورة');
      },
    });
  };

  const handleCopyUrl = async () => {
    if (!result) return;
    await copyToClipboard(result.mediaAsset.url, setCopied);
    toast.success('تم نسخ الرابط');
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.mediaAsset.url;
    link.download = result.mediaAsset.fileName;
    link.click();
  };

  const isGenerating = generateImage.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إنشاء صورة</h1>
          <p className="text-muted-foreground">
            استخدم الذكاء الاصطناعي لإنشاء صور احترافية
          </p>
        </div>
        <div className="text-left">
          {isLoadingCredits ? (
            <Skeleton className="h-8 w-24" />
          ) : creditBalance ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">الرصيد:</span>
              <Badge variant="secondary" className="text-lg">
                {creditBalance.available} وحدة
              </Badge>
            </div>
          ) : null}
        </div>
      </div>

      {/* Low Credits Warning */}
      {creditBalance && creditBalance.available < LOW_CREDIT_THRESHOLD && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            رصيد الوحدات منخفض. يرجى ترقية خطتك للحصول على المزيد من الوحدات.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الصورة</CardTitle>
            <CardDescription>
              اختر المشروع وحدد تفاصيل الصورة المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المشروع</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مشروعاً" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects?.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الصورة</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="صف الصورة التي تريد إنشاءها بالتفصيل..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحجم</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1024x1024">مربع</SelectItem>
                              <SelectItem value="1792x1024">أفقي</SelectItem>
                              <SelectItem value="1024x1792">عمودي</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الجودة</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">قياسية</SelectItem>
                              <SelectItem value="hd">عالية الدقة</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الأسلوب</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="natural">طبيعي</SelectItem>
                              <SelectItem value="vivid">حيوي</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Cost preview */}
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>تكلفة الإنشاء:</span>
                      <Badge>{IMAGE_GENERATION_CREDIT_COST} وحدات</Badge>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isGenerating || !projects?.length}
                  >
                    {isGenerating ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="ml-2 h-4 w-4" />
                    )}
                    {isGenerating ? 'جاري الإنشاء...' : 'إنشاء الصورة'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              الصورة المُنشأة
              {result && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={handleCopyUrl}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              سيتم عرض الصورة المُنشأة هنا
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <img
                  src={result.mediaAsset.url}
                  alt={result.revisedPrompt}
                  className="w-full rounded-lg"
                  loading="lazy"
                />
                {result.revisedPrompt && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      الوصف المُعدّل:
                    </p>
                    <p className="text-sm">{result.revisedPrompt}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{result.mediaAsset.fileName}</span>
                  <span>{(result.mediaAsset.sizeBytes / 1024).toFixed(0)} KB</span>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                صف الصورة واضغط "إنشاء الصورة" للبدء
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
