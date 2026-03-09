import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Copy, Loader2, Smile, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjects } from '@/features/projects';
import { useTemplates } from '@/features/templates';
import {
  useGenerateContent,
  type ContentGoal,
  type ContentLanguageMode,
  type ContentLength,
  type ContentTone,
} from '@/features/content';
import { useCreditBalance } from '@/features/credits';
import { PublishNowSection } from '@/features/publishing';
import { useFeatureFlag } from '@/features/config/hooks/use-feature-flag';
import { useProjectPersonas } from '@/features/audience-personas';
import { useProducts } from '@/features/product-catalog';
import { toast } from 'sonner';
import { LOW_CREDIT_THRESHOLD } from '@/config/constants';
import { copyToClipboard } from '@/utils';

const toneOptions = ['professional', 'casual', 'friendly', 'formal'] as const;
const lengthOptions = ['short', 'medium', 'long'] as const;
const goalOptions = ['Awareness', 'Engagement', 'Conversion'] as const;
const languageModeOptions = ['Arabic', 'English', 'Bilingual'] as const;
const noPersonaValue = 'none';

const formSchema = z.object({
  projectId: z.string().min(1, 'اختر مشروعاً'),
  templateId: z.string().min(1, 'اختر قالباً'),
  topic: z.string().min(1, 'أدخل الموضوع'),
  tone: z.enum(toneOptions).optional(),
  length: z.enum(lengthOptions).optional(),
  languageMode: z.enum(languageModeOptions),
  includeEmojis: z.boolean(),
  goal: z.enum(goalOptions).optional(),
  personaId: z.string().optional(),
  productIds: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

function mapLanguageModeToLegacyValue(languageMode: ContentLanguageMode) {
  switch (languageMode) {
    case 'Arabic':
      return 'ar';
    case 'English':
      return 'en';
    case 'Bilingual':
      return 'both';
    default:
      return 'ar';
  }
}

export default function ContentCreatePage() {
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedContentId, setGeneratedContentId] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();
  const { isEnabled: businessContextEnabled } = useFeatureFlag('business_context_generation');
  const { isEnabled: personasEnabled } = useFeatureFlag('audience_personas');
  const { isEnabled: productsEnabled } = useFeatureFlag('product_catalog');

  const generateContent = useGenerateContent();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: '',
      templateId: '',
      topic: '',
      tone: 'professional',
      length: 'medium',
      languageMode: 'Arabic',
      includeEmojis: false,
      goal: 'Engagement',
      personaId: noPersonaValue,
      productIds: [],
    },
  });

  const selectedProjectId = form.watch('projectId');
  const selectedTemplateId = form.watch('templateId');
  const selectedProductIds = form.watch('productIds');
  const selectedTemplate = templates?.find((template) => template.id === selectedTemplateId);
  const { data: personas } = useProjectPersonas(selectedProjectId || undefined);
  const { data: products } = useProducts(selectedProjectId || undefined);

  const availableProducts = useMemo(
    () => (products || []).filter((product) => product.isActive),
    [products]
  );

  const onSubmit = async (data: FormData) => {
    if (selectedTemplate && creditBalance && creditBalance.available < selectedTemplate.creditCost) {
      toast.error('رصيد الوحدات غير كافٍ');
      return;
    }

    generateContent.mutate(
      {
        projectId: data.projectId,
        templateId: data.templateId,
        inputs: {
          topic: data.topic,
        },
        language: mapLanguageModeToLegacyValue(data.languageMode),
        languageMode: data.languageMode,
        tone: (data.tone ?? 'professional') as ContentTone,
        length: (data.length ?? 'medium') as ContentLength,
        includeEmojis: data.includeEmojis,
        goal: businessContextEnabled ? (data.goal as ContentGoal | undefined) : undefined,
        personaId: businessContextEnabled && personasEnabled && data.personaId !== noPersonaValue
          ? data.personaId
          : undefined,
        productIds: businessContextEnabled && productsEnabled ? data.productIds : undefined,
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
    await copyToClipboard(generatedContent, setCopied);
    toast.success('تم نسخ المحتوى');
  };

  const isLoading = isLoadingProjects || isLoadingTemplates;
  const isGenerating = generateContent.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إنشاء محتوى</h1>
          <p className="text-muted-foreground">
            أضف سياق العمل، ثم أنشئ محتوى أكثر دقة وقابلية للنشر
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

      {creditBalance && creditBalance.available < LOW_CREDIT_THRESHOLD && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            رصيد الوحدات منخفض. يرجى ترقية خطتك للحصول على المزيد من الوحدات.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات المحتوى</CardTitle>
            <CardDescription>اختر المشروع والقالب ثم أضف الهدف والسياق التجاري</CardDescription>
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
                                {template.name}
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
                            placeholder="اكتب الفكرة الرئيسية أو العرض أو الرسالة التي تريد تحويلها إلى محتوى..."
                            rows={4}
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
                    name="languageMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وضع اللغة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Arabic">العربية</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Bilingual">ثنائي اللغة</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {businessContextEnabled && (
                    <div className="space-y-4 rounded-xl border p-4">
                      <div>
                        <h3 className="font-medium">السياق التجاري</h3>
                        <p className="text-sm text-muted-foreground">
                          استخدم الهدف والشخصية والمنتجات لجعل الناتج أكثر تحديداً وأقرب للبيع.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الهدف</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Awareness">زيادة الوعي</SelectItem>
                                <SelectItem value="Engagement">رفع التفاعل</SelectItem>
                                <SelectItem value="Conversion">تحويل ومبيعات</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      {personasEnabled && selectedProjectId && (
                        <FormField
                          control={form.control}
                          name="personaId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شخصية الجمهور</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || noPersonaValue}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="بدون شخصية محددة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={noPersonaValue}>بدون شخصية محددة</SelectItem>
                                  {(personas || []).map((persona) => (
                                    <SelectItem key={persona.id} value={persona.id}>
                                      {persona.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                إذا لم تظهر شخصيات، أنشئها من صفحة المشاريع.
                              </p>
                            </FormItem>
                          )}
                        />
                      )}

                      {productsEnabled && selectedProjectId && (
                        <FormField
                          control={form.control}
                          name="productIds"
                          render={() => (
                            <FormItem>
                              <FormLabel>المنتجات / الخدمات</FormLabel>
                              <div className="space-y-2 rounded-lg border p-3">
                                {availableProducts.length ? (
                                  availableProducts.map((product) => {
                                    const checked = selectedProductIds.includes(product.id);
                                    return (
                                      <label key={product.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50">
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(value) => {
                                            const nextValues = value
                                              ? [...selectedProductIds, product.id]
                                              : selectedProductIds.filter((id) => id !== product.id);
                                            form.setValue('productIds', nextValues, { shouldDirty: true });
                                          }}
                                        />
                                        <div>
                                          <div className="font-medium text-sm">{product.nameAr || product.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {product.uniqueSellingPoint || product.descriptionAr || product.description}
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    لا توجد منتجات نشطة لهذا المشروع. أضفها من صفحة كتالوج المنتجات.
                                  </div>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="includeEmojis"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border p-3">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="flex items-center gap-2">
                          <Smile className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className="cursor-pointer text-sm font-normal">
                            تضمين الإيموجي في المحتوى
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {selectedTemplate && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>تكلفة الإنشاء:</span>
                        <Badge>{selectedTemplate.creditCost} وحدة</Badge>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isGenerating || !projects?.length || !templates?.length}>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              المحتوى المُنشأ
              {generatedContent && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </CardTitle>
            <CardDescription>سيظهر الناتج هنا بعد اكتمال التوليد</CardDescription>
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
                أضف الفكرة والسياق ثم اضغط "إنشاء المحتوى"
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
