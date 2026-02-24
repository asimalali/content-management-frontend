import { useState } from 'react';
import { Globe, Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
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
  useAdminEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '@/features/events';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import type { GlobalEventResponse, CreateGlobalEventRequest, EventCategory } from '@/features/events';

const CATEGORY_LABELS: Record<string, string> = {
  Commercial: 'تجاري',
  Cultural: 'ثقافي',
  Religious: 'ديني',
  Sports: 'رياضي',
  Health: 'صحي',
  Social: 'اجتماعي',
  Technical: 'تقني',
  Environmental: 'بيئي',
  Educational: 'تعليمي',
};

const CATEGORIES: EventCategory[] = [
  'Commercial', 'Cultural', 'Religious', 'Sports', 'Health',
  'Social', 'Technical', 'Environmental', 'Educational',
];

const emptyForm: CreateGlobalEventRequest = {
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  eventDate: '',
  category: 'Commercial',
  imageUrl: '',
  isRecurringYearly: true,
  tags: '',
  isActive: true,
};

export default function AdminEventsPage() {
  const { data: events, isLoading, error } = useAdminEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GlobalEventResponse | null>(null);
  const [form, setForm] = useState<CreateGlobalEventRequest>(emptyForm);

  const openCreate = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (event: GlobalEventResponse) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      titleAr: event.titleAr,
      description: event.description,
      descriptionAr: event.descriptionAr,
      eventDate: event.eventDate.split('T')[0],
      category: event.category,
      imageUrl: event.imageUrl ?? '',
      isRecurringYearly: event.isRecurringYearly,
      tags: event.tags ?? '',
      isActive: event.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.titleAr || !form.eventDate) {
      toast.error('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, data: form });
        toast.success('تم تحديث المناسبة');
      } else {
        await createEvent.mutateAsync(form);
        toast.success('تم إنشاء المناسبة');
      }
      setDialogOpen(false);
    } catch {
      toast.error(editingEvent ? 'فشل في تحديث المناسبة' : 'فشل في إنشاء المناسبة');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      toast.success('تم حذف المناسبة');
    } catch {
      toast.error('فشل في حذف المناسبة');
    }
  };

  const isSaving = createEvent.isPending || updateEvent.isPending;

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
        <p className="text-sm text-red-700">فشل في تحميل المناسبات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المناسبات العالمية</h1>
          <p className="text-muted-foreground">إضافة وتعديل المناسبات التي يستلهم منها المستخدمون</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مناسبة
        </Button>
      </div>

      {!events?.length ? (
        <Card className="p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد مناسبات. أضف أول مناسبة.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{event.titleAr}</span>
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[event.category] ?? event.category}
                    </Badge>
                    {!event.isActive && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        معطّل
                      </Badge>
                    )}
                    {event.isRecurringYearly && (
                      <Badge variant="outline" className="text-xs">
                        سنوي
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(event.eventDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(event)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(event.id)}
                    disabled={deleteEvent.isPending}
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
              {editingEvent ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">التاريخ *</label>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الفئة</label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as EventCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]} ({cat})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الصورة</label>
                <Input
                  value={form.imageUrl ?? ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  dir="ltr"
                  placeholder="https://..."
                />
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

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isRecurringYearly ?? true}
                  onCheckedChange={(v) => setForm({ ...form, isRecurringYearly: v })}
                />
                <label className="text-sm">تتكرر سنوياً</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive ?? true}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <label className="text-sm">مفعّلة</label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {editingEvent ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
