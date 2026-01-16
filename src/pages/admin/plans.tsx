import { useState } from 'react';
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useAddFeature,
  useDeleteFeature,
  type AdminPlan,
} from '@/features/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminPlansPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [planDialog, setPlanDialog] = useState<{
    open: boolean;
    plan: AdminPlan | null;
  }>({ open: false, plan: null });
  const [featureDialog, setFeatureDialog] = useState<{
    open: boolean;
    planId: string | null;
  }>({ open: false, planId: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    planId: string | null;
  }>({ open: false, planId: null });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    priceMonthly: '',
    priceYearly: '',
    creditsMonthly: '',
    isActive: true,
  });
  const [featureData, setFeatureData] = useState({
    featureKey: '',
    featureValue: '',
    displayName: '',
    description: '',
    isVisible: true,
  });

  const { data: plans, isLoading } = useAdminPlans(includeInactive);
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const addFeature = useAddFeature();
  const deleteFeature = useDeleteFeature();

  const openPlanDialog = (plan: AdminPlan | null) => {
    if (plan) {
      setFormData({
        name: plan.name,
        slug: plan.slug,
        priceMonthly: plan.priceMonthly.toString(),
        priceYearly: plan.priceYearly?.toString() || '',
        creditsMonthly: plan.creditsMonthly.toString(),
        isActive: plan.isActive,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        priceMonthly: '',
        priceYearly: '',
        creditsMonthly: '',
        isActive: true,
      });
    }
    setPlanDialog({ open: true, plan });
  };

  const handleSavePlan = async () => {
    try {
      const data = {
        name: formData.name,
        slug: formData.slug,
        priceMonthly: parseFloat(formData.priceMonthly),
        priceYearly: formData.priceYearly ? parseFloat(formData.priceYearly) : undefined,
        creditsMonthly: parseInt(formData.creditsMonthly),
        isActive: formData.isActive,
      };

      if (planDialog.plan) {
        await updatePlan.mutateAsync({ planId: planDialog.plan.id, data });
        toast.success('تم تحديث الباقة بنجاح');
      } else {
        await createPlan.mutateAsync(data);
        toast.success('تم إنشاء الباقة بنجاح');
      }
      setPlanDialog({ open: false, plan: null });
    } catch {
      toast.error('فشل حفظ الباقة');
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteDialog.planId) return;
    try {
      await deletePlan.mutateAsync(deleteDialog.planId);
      toast.success('تم حذف الباقة بنجاح');
      setDeleteDialog({ open: false, planId: null });
    } catch {
      toast.error('فشل حذف الباقة');
    }
  };

  const openFeatureDialog = (planId: string) => {
    setFeatureData({
      featureKey: '',
      featureValue: '',
      displayName: '',
      description: '',
      isVisible: true,
    });
    setFeatureDialog({ open: true, planId });
  };

  const handleAddFeature = async () => {
    if (!featureDialog.planId) return;
    try {
      await addFeature.mutateAsync({
        planId: featureDialog.planId,
        feature: featureData,
      });
      toast.success('تم إضافة الميزة بنجاح');
      setFeatureDialog({ open: false, planId: null });
    } catch {
      toast.error('فشل إضافة الميزة');
    }
  };

  const handleDeleteFeature = async (planId: string, featureId: string) => {
    try {
      await deleteFeature.mutateAsync({ planId, featureId });
      toast.success('تم حذف الميزة بنجاح');
    } catch {
      toast.error('فشل حذف الميزة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الباقات</h1>
          <p className="text-muted-foreground">إنشاء وتعديل باقات الاشتراك</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="include-inactive"
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
            />
            <Label htmlFor="include-inactive">عرض الباقات غير النشطة</Label>
          </div>
          <Button onClick={() => openPlanDialog(null)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة باقة
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : plans?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لا توجد باقات
            </CardContent>
          </Card>
        ) : (
          plans?.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="cursor-pointer" onClick={() =>
                setExpandedPlan(expandedPlan === plan.id ? null : plan.id)
              }>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>{plan.name}</CardTitle>
                    {!plan.isActive && (
                      <Badge variant="secondary">غير نشط</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      ${plan.priceMonthly}/شهر
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPlanDialog(plan);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({ open: true, planId: plan.id });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    {expandedPlan === plan.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {plan.creditsMonthly} رصيد شهريًا | الرمز: {plan.slug}
                </div>
              </CardHeader>

              {expandedPlan === plan.id && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">الميزات</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openFeatureDialog(plan.id)}
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة ميزة
                      </Button>
                    </div>

                    {plan.features.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        لا توجد ميزات
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>المفتاح</TableHead>
                            <TableHead>القيمة</TableHead>
                            <TableHead>العرض</TableHead>
                            <TableHead>مرئي</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.features.map((feature) => (
                            <TableRow key={feature.id}>
                              <TableCell className="font-mono text-sm">
                                {feature.featureKey}
                              </TableCell>
                              <TableCell>{feature.featureValue}</TableCell>
                              <TableCell>{feature.displayName}</TableCell>
                              <TableCell>
                                {feature.isVisible ? (
                                  <Badge variant="default">نعم</Badge>
                                ) : (
                                  <Badge variant="secondary">لا</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    handleDeleteFeature(plan.id, feature.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Plan Dialog */}
      <Dialog
        open={planDialog.open}
        onOpenChange={(open) => setPlanDialog({ ...planDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {planDialog.plan ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">الرمز</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  disabled={!!planDialog.plan}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceMonthly">السعر الشهري ($)</Label>
                <Input
                  id="priceMonthly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceMonthly}
                  onChange={(e) =>
                    setFormData({ ...formData, priceMonthly: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceYearly">السعر السنوي ($)</Label>
                <Input
                  id="priceYearly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceYearly}
                  onChange={(e) =>
                    setFormData({ ...formData, priceYearly: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditsMonthly">الرصيد الشهري</Label>
              <Input
                id="creditsMonthly"
                type="number"
                min="0"
                value={formData.creditsMonthly}
                onChange={(e) =>
                  setFormData({ ...formData, creditsMonthly: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPlanDialog({ open: false, plan: null })}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={createPlan.isPending || updatePlan.isPending}
            >
              {createPlan.isPending || updatePlan.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Dialog */}
      <Dialog
        open={featureDialog.open}
        onOpenChange={(open) => setFeatureDialog({ ...featureDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة ميزة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="featureKey">المفتاح</Label>
                <Input
                  id="featureKey"
                  value={featureData.featureKey}
                  onChange={(e) =>
                    setFeatureData({ ...featureData, featureKey: e.target.value })
                  }
                  placeholder="max_projects"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featureValue">القيمة</Label>
                <Input
                  id="featureValue"
                  value={featureData.featureValue}
                  onChange={(e) =>
                    setFeatureData({ ...featureData, featureValue: e.target.value })
                  }
                  placeholder="10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">اسم العرض</Label>
              <Input
                id="displayName"
                value={featureData.displayName}
                onChange={(e) =>
                  setFeatureData({ ...featureData, displayName: e.target.value })
                }
                placeholder="الحد الأقصى للمشاريع"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="featureVisible"
                checked={featureData.isVisible}
                onCheckedChange={(checked) =>
                  setFeatureData({ ...featureData, isVisible: checked })
                }
              />
              <Label htmlFor="featureVisible">مرئي للمستخدمين</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeatureDialog({ open: false, planId: null })}
            >
              إلغاء
            </Button>
            <Button onClick={handleAddFeature} disabled={addFeature.isPending}>
              {addFeature.isPending ? 'جاري الإضافة...' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إلغاء تنشيط هذه الباقة. لن يتمكن المستخدمون الجدد من
              الاشتراك فيها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlan.isPending ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
