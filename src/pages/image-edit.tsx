import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  ImageIcon,
  AlertCircle,
  Download,
  Copy,
  Check,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjects } from '@/features/projects';
import { useEditImage, type ImageEditingResponse } from '@/features/content';
import { useCreditBalance } from '@/features/credits';
import { toast } from 'sonner';
import {
  LOW_CREDIT_THRESHOLD,
  IMAGE_EDITING_CREDIT_COST,
} from '@/config/constants';
import { copyToClipboard } from '@/utils';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const formSchema = z.object({
  projectId: z.string().min(1, 'اختر مشروعاً'),
  prompt: z
    .string()
    .min(1, 'أدخل وصف التعديل المطلوب')
    .max(4000, 'الحد الأقصى 4000 حرف'),
});

type FormData = z.infer<typeof formSchema>;

export default function ImageEditPage() {
  const [result, setResult] = useState<ImageEditingResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();
  const editImage = useEditImage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: '',
      prompt: '',
    },
  });

  const handleFileSelect = (file: File | undefined | null) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('صيغة الملف غير مدعومة. يُرجى رفع صورة JPEG أو PNG أو WebP');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = (data: FormData) => {
    if (!selectedFile) {
      toast.error('يرجى رفع صورة أولاً');
      return;
    }

    if (creditBalance && creditBalance.available < IMAGE_EDITING_CREDIT_COST) {
      toast.error('رصيد الوحدات غير كافٍ');
      return;
    }

    editImage.mutate(
      { projectId: data.projectId, prompt: data.prompt, image: selectedFile },
      {
        onSuccess: (response) => {
          setResult(response);
          toast.success('تم تعديل الصورة بنجاح');
        },
        onError: () => {
          toast.error('فشل تعديل الصورة');
        },
      }
    );
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

  const isEditing = editImage.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تعديل صورة</h1>
          <p className="text-muted-foreground">
            ارفع صورة وصف التعديلات المطلوبة — يعمل بتقنية Grok
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
            <CardTitle>إعدادات التعديل</CardTitle>
            <CardDescription>
              ارفع صورتك وصف التغييرات التي تريدها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المشروع</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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

                  {/* Image Upload Zone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الصورة الأصلية</label>
                    {selectedFile && previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="معاينة الصورة"
                          className="w-full rounded-lg object-cover max-h-48"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-6 w-6"
                          onClick={handleRemoveFile}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedFile.name} — {(selectedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <div
                        onDrop={handleFileDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                          اسحب وأفلت الصورة هنا، أو اضغط للاختيار
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPEG · PNG · WebP · GIF
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(',')}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف التعديل المطلوب</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="مثال: ضع هذه الحقيبة في حديقة خضراء مع أزهار..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cost preview */}
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>تكلفة التعديل:</span>
                      <Badge>{IMAGE_EDITING_CREDIT_COST} وحدات</Badge>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isEditing || !projects?.length || !selectedFile}
                  >
                    {isEditing ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="ml-2 h-4 w-4" />
                    )}
                    {isEditing ? 'جاري التعديل...' : 'تعديل الصورة'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Result Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              الصورة المُعدَّلة
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
            <CardDescription>سيتم عرض الصورة المُعدَّلة هنا</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
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
                      الوصف المُعدَّل:
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
                ارفع صورة وأدخل وصف التعديل للبدء
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
