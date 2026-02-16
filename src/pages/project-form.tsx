import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useParams } from 'wouter';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProject,
  useCreateProject,
  useUpdateProject,
  useBrandDna,
  useGenerateBrandDna,
  useUpdateBrandDna,
} from '@/features/projects';
import { toast } from 'sonner';

const projectSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب'),
  brandName: z.string().min(1, 'اسم العلامة التجارية مطلوب'),
  industry: z.string().min(1, 'اختر صناعة'),
  description: z.string().optional(),
  website: z.string().url('رابط غير صالح').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const industries = [
  { value: 'retail', label: 'تجارة التجزئة' },
  { value: 'food', label: 'الأغذية والمشروبات' },
  { value: 'technology', label: 'التقنية' },
  { value: 'healthcare', label: 'الرعاية الصحية' },
  { value: 'education', label: 'التعليم' },
  { value: 'finance', label: 'المالية' },
  { value: 'real_estate', label: 'العقارات' },
  { value: 'travel', label: 'السفر والسياحة' },
  { value: 'fashion', label: 'الأزياء' },
  { value: 'other', label: 'أخرى' },
];

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default function ProjectFormPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params.id;

  // Fetch project data when editing
  const { data: project, isLoading: isLoadingProject } = useProject(params.id);

  // Mutations
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const generateBrandDna = useGenerateBrandDna();
  const updateBrandDna = useUpdateBrandDna();

  const { data: brandDna, isLoading: isLoadingBrandDna } = useBrandDna(params.id);
  const [brandDnaForm, setBrandDnaForm] = useState({
    voice: '',
    tone: '',
    targetAudience: '',
    keyMessagesText: '',
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      brandName: '',
      industry: '',
      description: '',
      website: '',
    },
  });

  // Populate form when project data is loaded
  useEffect(() => {
    if (isEditing && project) {
      form.reset({
        name: project.name,
        brandName: project.brandName,
        industry: project.industry,
        description: project.description || '',
        website: project.website || '',
      });
    }
  }, [isEditing, project, form]);

  useEffect(() => {
    if (!brandDna) return;

    setBrandDnaForm({
      voice: brandDna.voice || '',
      tone: brandDna.tone || '',
      targetAudience: brandDna.targetAudience || '',
      keyMessagesText: (brandDna.keyMessages || []).join('\n'),
    });
  }, [brandDna]);

  const onSubmit = async (data: ProjectFormData) => {
    if (isEditing && params.id) {
      // Update existing project
      updateProject.mutate(
        { projectId: params.id, data },
        {
          onSuccess: () => {
            toast.success('تم تحديث المشروع بنجاح');
            setLocation('/projects');
          },
          onError: () => {
            toast.error('فشل تحديث المشروع');
          },
        }
      );
    } else {
      // Create new project
      createProject.mutate(data, {
        onSuccess: () => {
          toast.success('تم إنشاء المشروع بنجاح');
          setLocation('/projects');
        },
        onError: () => {
          toast.error('فشل إنشاء المشروع');
        },
      });
    }
  };

  const isSubmitting = createProject.isPending || updateProject.isPending;
  const hasBrandDna =
    !!brandDna ||
    brandDnaForm.voice.trim().length > 0 ||
    brandDnaForm.tone.trim().length > 0 ||
    brandDnaForm.targetAudience.trim().length > 0 ||
    brandDnaForm.keyMessagesText.trim().length > 0;
  const isSavingBrandDna = generateBrandDna.isPending || updateBrandDna.isPending;
  const hasRequiredBrandDnaFields =
    brandDnaForm.voice.trim().length > 0 &&
    brandDnaForm.tone.trim().length > 0 &&
    brandDnaForm.targetAudience.trim().length > 0;

  const handleGenerateBrandDna = () => {
    if (!params.id) return;

    generateBrandDna.mutate(params.id, {
      onSuccess: (generatedDna) => {
        setBrandDnaForm({
          voice: generatedDna.voice || '',
          tone: generatedDna.tone || '',
          targetAudience: generatedDna.targetAudience || '',
          keyMessagesText: (generatedDna.keyMessages || []).join('\n'),
        });
        toast.success('تم توليد بصمة العلامة التجارية');
      },
      onError: () => {
        toast.error('فشل توليد بصمة العلامة التجارية');
      },
    });
  };

  const handleSaveBrandDna = () => {
    if (!params.id) return;

    updateBrandDna.mutate(
      {
        projectId: params.id,
        data: {
          voice: brandDnaForm.voice.trim(),
          tone: brandDnaForm.tone.trim(),
          targetAudience: brandDnaForm.targetAudience.trim(),
          keyMessages: brandDnaForm.keyMessagesText
            .split('\n')
            .map((message) => message.trim())
            .filter((message) => message.length > 0),
        },
      },
      {
        onSuccess: () => {
          toast.success('تم حفظ بصمة العلامة التجارية');
        },
        onError: () => {
          toast.error('فشل حفظ بصمة العلامة التجارية');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/projects')}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'تعديل المشروع' : 'مشروع جديد'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'قم بتحديث معلومات مشروعك' : 'أضف مشروعاً جديداً لتنظيم محتواك'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المشروع</CardTitle>
            <CardDescription>
              أدخل المعلومات الأساسية للمشروع
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing && isLoadingProject ? (
              <FormSkeleton />
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المشروع</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: متجر الأزياء" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العلامة التجارية</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: أناقة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الصناعة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر صناعة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
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
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموقع الإلكتروني (اختياري)</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف مختصر عن المشروع والعلامة التجارية..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? 'حفظ التغييرات' : 'إنشاء المشروع'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation('/projects')}
                      disabled={isSubmitting}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isEditing && (
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>بصمة العلامة التجارية (Brand DNA)</CardTitle>
                    <CardDescription>
                      قم بتوليد أو تعديل بصمة العلامة لتحسين جودة المحتوى
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateBrandDna}
                    disabled={generateBrandDna.isPending || !params.id}
                  >
                    {generateBrandDna.isPending && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                    {hasBrandDna ? 'إعادة التوليد' : 'توليد البصمة'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingBrandDna ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!hasBrandDna && (
                      <p className="text-sm text-muted-foreground">
                        لا توجد بصمة علامة محفوظة بعد. اضغط "توليد البصمة" لإنشائها.
                      </p>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium">الصوت</p>
                      <Input
                        value={brandDnaForm.voice}
                        onChange={(event) =>
                          setBrandDnaForm((current) => ({ ...current, voice: event.target.value }))
                        }
                        placeholder="مثال: احترافي ودود"
                        disabled={!hasBrandDna || isSavingBrandDna}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">النبرة</p>
                      <Input
                        value={brandDnaForm.tone}
                        onChange={(event) =>
                          setBrandDnaForm((current) => ({ ...current, tone: event.target.value }))
                        }
                        placeholder="مثال: واضحة ومباشرة"
                        disabled={!hasBrandDna || isSavingBrandDna}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">الجمهور المستهدف</p>
                      <Input
                        value={brandDnaForm.targetAudience}
                        onChange={(event) =>
                          setBrandDnaForm((current) => ({ ...current, targetAudience: event.target.value }))
                        }
                        placeholder="مثال: أصحاب المشاريع الصغيرة"
                        disabled={!hasBrandDna || isSavingBrandDna}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">الرسائل الرئيسية (سطر لكل رسالة)</p>
                      <Textarea
                        value={brandDnaForm.keyMessagesText}
                        onChange={(event) =>
                          setBrandDnaForm((current) => ({ ...current, keyMessagesText: event.target.value }))
                        }
                        placeholder="اكتب كل رسالة في سطر مستقل"
                        rows={5}
                        disabled={!hasBrandDna || isSavingBrandDna}
                      />
                    </div>

                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleSaveBrandDna}
                      disabled={!hasBrandDna || isSavingBrandDna || !hasRequiredBrandDnaFields}
                    >
                      {updateBrandDna.isPending && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      حفظ بصمة العلامة
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle>نصائح</CardTitle>
              <CardDescription>
                لتحقيق أفضل النتائج
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-1">اسم المشروع</h4>
                <p>استخدم اسماً واضحاً يساعدك على تمييز المشروع بسهولة.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">العلامة التجارية</h4>
                <p>أدخل الاسم التجاري كما تريده أن يظهر في المحتوى المُنشأ.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">الصناعة</h4>
                <p>اختيار الصناعة الصحيحة يساعد الذكاء الاصطناعي على فهم سياق عملك.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">الموقع الإلكتروني</h4>
                <p>إضافة موقعك يتيح للذكاء الاصطناعي تحليل هوية علامتك التجارية.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
