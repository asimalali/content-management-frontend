import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjects } from '@/features/projects';
import { useTemplates } from '@/features/templates';
import { useGenerateContent } from '@/features/content';
import { useCreditBalance } from '@/features/credits';
import { PublishNowSection } from '@/features/publishing';
import { toast } from 'sonner';

const formSchema = z.object({
  projectId: z.string().min(1, 'اختر مشروعاً'),
  templateId: z.string().min(1, 'اختر قالباً'),
  topic: z.string().min(1, 'أدخل الموضوع'),
  tone: z.string().optional(),
  length: z.string().optional(),
  language: z.enum(['en', 'ar', 'both']),
});

type FormData = z.infer<typeof formSchema>;

export default function ContentCreatePage() {
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedContentId, setGeneratedContentId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Fetch data from API
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();

  // Generate content mutation
  const generateContent = useGenerateContent();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: '',
      templateId: '',
      topic: '',
      tone: 'professional',
      length: 'medium',
      language: 'ar',
    },
  });

  const selectedTemplateId = form.watch('templateId');
  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const onSubmit = async (data: FormData) => {
    // Check if user has enough credits
    if (selectedTemplate && creditBalance) {
      if (creditBalance.available < selectedTemplate.creditCost) {
        toast.error('رصيد الوحدات غير كافٍ');
        return;
      }
    }

    generateContent.mutate(
      {
        projectId: data.projectId,
        templateId: data.templateId,
        inputs: {
          topic: data.topic,
          // Note: tone and length are now passed as top-level params, not in inputs
        },
        language: data.language,
        tone: data.tone || 'professional',
        length: data.length || 'medium',
      },
      {
        onSuccess: (result) => {
          setGeneratedContent(result.content);
          setGeneratedContentId(result.id);
          toast.success('تم إنشاء المحتوى بنجاح');
        },
        onError: () => {
          toast.error('فشل إنشاء المحتوى');
        },
      }
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('تم نسخ المحتوى');
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = isLoadingProjects || isLoadingTemplates;
  const isGenerating = generateContent.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إنشاء محتوى</h1>
          <p className="text-muted-foreground">
            استخدم الذكاء الاصطناعي لإنشاء محتوى احترافي
          </p>
        </div>
        {/* Credit Balance */}
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
      {creditBalance && creditBalance.available < 5 && (
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
            <CardTitle>إعدادات المحتوى</CardTitle>
            <CardDescription>
              اختر المشروع والقالب وحدد تفاصيل المحتوى
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
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
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القالب</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر قالباً" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates?.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <span className="flex items-center gap-2">
                                  {template.name}
                                  <Badge variant="outline">
                                    {template.creditCost} وحدة
                                  </Badge>
                                </span>
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
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموضوع</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="اكتب موضوع المحتوى أو الفكرة الرئيسية..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tone"
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
                              <SelectItem value="professional">احترافي</SelectItem>
                              <SelectItem value="casual">غير رسمي</SelectItem>
                              <SelectItem value="friendly">ودي</SelectItem>
                              <SelectItem value="formal">رسمي</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الطول</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="short">قصير</SelectItem>
                              <SelectItem value="medium">متوسط</SelectItem>
                              <SelectItem value="long">طويل</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>لغة المحتوى</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="both">كلاهما (عربي + English)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Cost preview */}
                  {selectedTemplate && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>تكلفة الإنشاء:</span>
                        <Badge>{selectedTemplate.creditCost} وحدة</Badge>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isGenerating || !projects?.length || !templates?.length}
                  >
                    {isGenerating ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="ml-2 h-4 w-4" />
                    )}
                    {isGenerating ? 'جاري الإنشاء...' : 'إنشاء المحتوى'}
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
              المحتوى المُنشأ
              {generatedContent && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              سيظهر المحتوى المُنشأ هنا
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : generatedContent ? (
              <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                {generatedContent}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                املأ النموذج واضغط "إنشاء المحتوى" للبدء
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Publish Now Section - appears after content is generated */}
      {generatedContent && form.getValues('projectId') && (
        <PublishNowSection
          projectId={form.getValues('projectId')}
          initialContent={generatedContent}
          contentItemId={generatedContentId || undefined}
        />
      )}
    </div>
  );
}
