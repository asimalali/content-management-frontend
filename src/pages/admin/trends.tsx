import { useState } from 'react';
import { TrendingUp, Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useAdminTrends,
  useCreateTrend,
  useUpdateTrend,
  useDeleteTrend,
} from '@/features/trends';
import { toast } from 'sonner';
import type { MonthlyTrendResponse, CreateMonthlyTrendRequest } from '@/features/trends';

const PLATFORM_LABELS: Record<string, string> = {
  X: 'X (تويتر)',
  Instagram: 'انستقرام',
  TikTok: 'تيك توك',
  Facebook: 'فيسبوك',
};

const PLATFORMS = ['X', 'Instagram', 'TikTok', 'Facebook'];

const CONTENT_TYPES = [
  { value: 'video', label: 'فيديو' },
  { value: 'image', label: 'صورة' },
  { value: 'text', label: 'نص' },
  { value: 'carousel', label: 'كاروسيل' },
];

const MONTHS = [
  { value: 1, label: 'يناير' },
  { value: 2, label: 'فبراير' },
  { value: 3, label: 'مارس' },
  { value: 4, label: 'أبريل' },
  { value: 5, label: 'مايو' },
  { value: 6, label: 'يونيو' },
  { value: 7, label: 'يوليو' },
  { value: 8, label: 'أغسطس' },
  { value: 9, label: 'سبتمبر' },
  { value: 10, label: 'أكتوبر' },
  { value: 11, label: 'نوفمبر' },
  { value: 12, label: 'ديسمبر' },
];

const now = new Date();

const emptyForm: CreateMonthlyTrendRequest = {
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  platform: 'X',
  trendMonth: now.getMonth() + 1,
  trendYear: now.getFullYear(),
  contentType: 'video',
  exampleContent: '',
  sourceUrl: '',
  thumbnailUrl: '',
  tags: '',
  isActive: true,
};

export default function AdminTrendsPage() {
  const { data: trends, isLoading, error } = useAdminTrends();
  const createTrend = useCreateTrend();
  const updateTrend = useUpdateTrend();
  const deleteTrend = useDeleteTrend();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrend, setEditingTrend] = useState<MonthlyTrendResponse | null>(null);
  const [form, setForm] = useState<CreateMonthlyTrendRequest>(emptyForm);

  const openCreate = () => {
    setEditingTrend(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (trend: MonthlyTrendResponse) => {
    setEditingTrend(trend);
    setForm({
      title: trend.title,
      titleAr: trend.titleAr,
      description: trend.description,
      descriptionAr: trend.descriptionAr,
      platform: trend.platform,
      trendMonth: trend.trendMonth,
      trendYear: trend.trendYear,
      contentType: trend.contentType,
      exampleContent: trend.exampleContent ?? '',
      sourceUrl: trend.sourceUrl ?? '',
      thumbnailUrl: trend.thumbnailUrl ?? '',
      tags: trend.tags ?? '',
      isActive: trend.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.titleAr) {
      toast.error('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    try {
      if (editingTrend) {
        await updateTrend.mutateAsync({ id: editingTrend.id, data: form });
        toast.success('تم تحديث التوجه');
      } else {
        await createTrend.mutateAsync(form);
        toast.success('تم إنشاء التوجه');
      }
      setDialogOpen(false);
    } catch {
      toast.error(editingTrend ? 'فشل في تحديث التوجه' : 'فشل في إنشاء التوجه');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTrend.mutateAsync(id);
      toast.success('تم حذف التوجه');
    } catch {
      toast.error('فشل في حذف التوجه');
    }
  };

  const isSaving = createTrend.isPending || updateTrend.isPending;

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
        <p className="text-sm text-red-700">فشل في تحميل التوجهات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة التوجهات الشهرية</h1>
          <p className="text-muted-foreground">إضافة وتعديل التوجهات التي يستلهم منها المستخدمون</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة توجه
        </Button>
      </div>

      {!trends?.length ? (
        <Card className="p-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد توجهات. أضف أول توجه.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {trends.map((trend) => (
            <Card key={trend.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{trend.titleAr}</span>
                    <Badge variant="outline" className="text-xs">
                      {PLATFORM_LABELS[trend.platform] ?? trend.platform}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {CONTENT_TYPES.find((t) => t.value === trend.contentType)?.label ?? trend.contentType}
                    </Badge>
                    {!trend.isActive && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        معطّل
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{trend.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {MONTHS.find((m) => m.value === trend.trendMonth)?.label} {trend.trendYear} — {trend.usageCount} استخدام
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(trend)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(trend.id)}
                    disabled={deleteTrend.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTrend ? 'تعديل التوجه' : 'إضافة توجه جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان (عربي) *</label>
                <Input
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title (English) *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف (عربي)</label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  dir="rtl"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (English)</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  dir="ltr"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">المنصة</label>
                <Select
                  value={form.platform}
                  onValueChange={(v) => setForm({ ...form, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PLATFORM_LABELS[p]} ({p})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الشهر</label>
                <Select
                  value={String(form.trendMonth)}
                  onValueChange={(v) => setForm({ ...form, trendMonth: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">السنة</label>
                <Input
                  type="number"
                  value={form.trendYear}
                  onChange={(e) => setForm({ ...form, trendYear: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع المحتوى</label>
                <Select
                  value={form.contentType}
                  onValueChange={(v) => setForm({ ...form, contentType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الوسوم</label>
                <Input
                  value={form.tags ?? ''}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="وسم1, وسم2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">محتوى مثال</label>
              <Textarea
                value={form.exampleContent ?? ''}
                onChange={(e) => setForm({ ...form, exampleContent: e.target.value })}
                rows={3}
                placeholder="مثال على كيفية استخدام هذا التوجه..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط المصدر</label>
                <Input
                  value={form.sourceUrl ?? ''}
                  onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الصورة المصغرة</label>
                <Input
                  value={form.thumbnailUrl ?? ''}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive ?? true}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <label className="text-sm">مفعّل</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {editingTrend ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
