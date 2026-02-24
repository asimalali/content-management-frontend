import { useState } from 'react';
import { Plus, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useProjects } from '@/features/projects';
import {
  useProducts,
  useDeleteProduct,
  ProductCard,
  ProductFormDialog,
  type Product,
} from '@/features/product-catalog';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: products, isLoading: isLoadingProducts, isError, refetch } = useProducts(
    selectedProjectId || undefined
  );
  const deleteProduct = useDeleteProduct();

  const handleOpenCreate = () => {
    if (!selectedProjectId) {
      toast.error('يرجى اختيار المشروع أولاً');
      return;
    }
    setEditProduct(undefined);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget || !selectedProjectId) return;

    deleteProduct.mutate(
      { projectId: selectedProjectId, productId: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success('تم حذف المنتج بنجاح');
          setDeleteTarget(null);
        },
        onError: () => {
          toast.error('فشل حذف المنتج');
          setDeleteTarget(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="كتالوج المنتجات"
        description="إدارة منتجاتك وخدماتك لتحسين المحتوى المُولَّد بالذكاء الاصطناعي"
        action={
          <Button onClick={handleOpenCreate} disabled={!selectedProjectId}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج
          </Button>
        }
      />

      {/* Project Selector */}
      <div className="max-w-sm">
        {isLoadingProjects ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المشروع" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Products Grid */}
      {!selectedProjectId ? (
        <EmptyState
          icon={Package}
          title="اختر مشروع"
          description="اختر مشروعاً من القائمة أعلاه لعرض المنتجات والخدمات"
        />
      ) : isLoadingProducts ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Package}
          title="حدث خطأ"
          description="تعذر تحميل المنتجات. يرجى المحاولة مرة أخرى."
          variant="error"
          onRetry={() => refetch()}
        />
      ) : !products || products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="لا توجد منتجات"
          description="أضف منتجاتك وخدماتك ليتم استخدامها كسياق في توليد المحتوى بالذكاء الاصطناعي"
          action={{ label: 'إضافة منتج', onClick: handleOpenCreate, icon: Plus }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => setDeleteTarget(product)}
              isDeleting={deleteProduct.isPending && deleteTarget?.id === product.id}
            />
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      {selectedProjectId && (
        <ProductFormDialog
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditProduct(undefined);
          }}
          projectId={selectedProjectId}
          product={editProduct}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="حذف المنتج"
        description={`هل أنت متأكد من حذف "${deleteTarget?.nameAr || deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={handleDelete}
        isPending={deleteProduct.isPending}
      />
    </div>
  );
}
