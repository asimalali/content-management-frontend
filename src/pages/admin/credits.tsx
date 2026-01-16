import { useState } from 'react';
import {
  useAdminCredits,
  useAdjustCredits,
  type AdminCreditQuery,
  type AdminCreditUser,
} from '@/features/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, Plus, Minus, ChevronRight, ChevronLeft } from 'lucide-react';

export default function AdminCreditsPage() {
  const [query, setQuery] = useState<AdminCreditQuery>({
    page: 1,
    pageSize: 20,
    sortBy: 'Available',
    sortDescending: false,
  });

  const [adjustDialog, setAdjustDialog] = useState<{
    open: boolean;
    user: AdminCreditUser | null;
    type: 'add' | 'deduct';
  }>({ open: false, user: null, type: 'add' });

  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const { data, isLoading } = useAdminCredits(query);
  const adjustCredits = useAdjustCredits();

  const openAdjustDialog = (user: AdminCreditUser, type: 'add' | 'deduct') => {
    setAdjustDialog({ open: true, user, type });
    setAdjustAmount('');
    setAdjustReason('');
  };

  const handleAdjust = async () => {
    if (!adjustDialog.user || !adjustAmount || !adjustReason) return;

    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صالح');
      return;
    }

    try {
      await adjustCredits.mutateAsync({
        userId: adjustDialog.user.userId,
        data: {
          amount: adjustDialog.type === 'add' ? amount : -amount,
          type: 'Adjustment',
          reason: adjustReason,
        },
      });
      toast.success('تم تعديل الرصيد بنجاح');
      setAdjustDialog({ open: false, user: null, type: 'add' });
    } catch {
      toast.error('فشل تعديل الرصيد');
    }
  };

  const getBalanceStatus = (user: AdminCreditUser) => {
    if (user.allocated === 0) return null;
    const percentage = (user.available / user.allocated) * 100;
    if (percentage < 10) {
      return <Badge variant="destructive">منخفض</Badge>;
    }
    if (percentage < 30) {
      return <Badge variant="secondary">متوسط</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إدارة الأرصدة</h1>
        <p className="text-muted-foreground">عرض وتعديل أرصدة المستخدمين</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أرصدة المستخدمين ({data?.totalCount ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالبريد أو الاسم..."
                className="pr-10"
                value={query.search || ''}
                onChange={(e) =>
                  setQuery({ ...query, search: e.target.value, page: 1 })
                }
              />
            </div>
            <Select
              value={query.lowBalance ? 'low' : 'all'}
              onValueChange={(value) =>
                setQuery({
                  ...query,
                  lowBalance: value === 'low' ? true : undefined,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الرصيد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="low">رصيد منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الباقة</TableHead>
                  <TableHead>المخصص</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>المتبقي</TableHead>
                  <TableHead className="w-32">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا يوجد بيانات
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.items.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.fullName || '-'}</TableCell>
                      <TableCell>{user.planName || '-'}</TableCell>
                      <TableCell>{user.allocated}</TableCell>
                      <TableCell>{user.used}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.available}
                          {getBalanceStatus(user)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openAdjustDialog(user, 'add')}
                            title="إضافة رصيد"
                          >
                            <Plus className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openAdjustDialog(user, 'deduct')}
                            title="خصم رصيد"
                            disabled={user.available === 0}
                          >
                            <Minus className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={query.page === 1}
                onClick={() => setQuery({ ...query, page: (query.page ?? 1) - 1 })}
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
              <span className="text-sm text-muted-foreground">
                صفحة {query.page} من {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={query.page === data.totalPages}
                onClick={() => setQuery({ ...query, page: (query.page ?? 1) + 1 })}
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Credits Dialog */}
      <Dialog
        open={adjustDialog.open}
        onOpenChange={(open) =>
          setAdjustDialog({ ...adjustDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustDialog.type === 'add' ? 'إضافة رصيد' : 'خصم رصيد'}
            </DialogTitle>
            <DialogDescription>
              {adjustDialog.user?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="أدخل المبلغ"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">السبب</Label>
              <Textarea
                id="reason"
                placeholder="أدخل سبب التعديل"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustDialog({ open: false, user: null, type: 'add' })}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAdjust}
              disabled={!adjustAmount || !adjustReason || adjustCredits.isPending}
            >
              {adjustCredits.isPending ? 'جاري التعديل...' : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
