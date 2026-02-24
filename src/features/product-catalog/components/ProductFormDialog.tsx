import { useState, useEffect } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-product-catalog';
import type { Product, CreateProductRequest } from '../types';
import { toast } from 'sonner';

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  product?: Product; // If provided, it's edit mode
}

export function ProductFormDialog({ isOpen, onClose, projectId, product }: ProductFormDialogProps) {
  const isEdit = !!product;

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uniqueSellingPoint, setUniqueSellingPoint] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setName(product.name);
      setNameAr(product.nameAr);
      setDescription(product.description);
      setDescriptionAr(product.descriptionAr);
      setPrice(product.price?.toString() || '');
      setCurrency(product.currency || 'SAR');
      setCategory(product.category || '');
      setImageUrl(product.imageUrl || '');
      setUniqueSellingPoint(product.uniqueSellingPoint || '');
      setFeatures(product.features || []);
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setName('');
    setNameAr('');
    setDescription('');
    setDescriptionAr('');
    setPrice('');
    setCurrency('SAR');
    setCategory('');
    setImageUrl('');
    setUniqueSellingPoint('');
    setFeatures([]);
    setFeatureInput('');
  };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  const handleSubmit = () => {
    if (!name.trim() || !nameAr.trim()) {
      toast.error('يرجى إدخال اسم المنتج بالعربية والإنجليزية');
      return;
    }

    const data: CreateProductRequest = {
      name: name.trim(),
      nameAr: nameAr.trim(),
      description: description.trim(),
      descriptionAr: descriptionAr.trim(),
      price: price ? parseFloat(price) : undefined,
      currency: currency || undefined,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      uniqueSellingPoint: uniqueSellingPoint || undefined,
      features: features.length > 0 ? features : undefined,
    };

    if (isEdit && product) {
      updateProduct.mutate(
        { projectId, productId: product.id, data },
        {
          onSuccess: () => {
            toast.success('تم تحديث المنتج بنجاح');
            onClose();
          },
          onError: () => toast.error('فشل تحديث المنتج'),
        }
      );
    } else {
      createProduct.mutate(
        { projectId, data },
        {
          onSuccess: () => {
            toast.success('تم إضافة المنتج بنجاح');
            resetForm();
            onClose();
          },
          onError: () => toast.error('فشل إضافة المنتج'),
        }
      );
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'قم بتعديل بيانات المنتج أو الخدمة' : 'أضف منتج أو خدمة جديدة لمشروعك'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name (EN + AR) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>الاسم (عربي) *</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="اسم المنتج"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم (إنجليزي) *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                dir="ltr"
              />
            </div>
          </div>

          {/* Description (AR + EN) */}
          <div className="space-y-2">
            <Label>الوصف (عربي)</Label>
            <Textarea
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="وصف المنتج أو الخدمة..."
              rows={2}
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label>الوصف (إنجليزي)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product or service description..."
              rows={2}
              dir="ltr"
            />
          </div>

          {/* Price + Currency + Category */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>السعر</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>العملة</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="SAR"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثال: تقنية"
              />
            </div>
          </div>

          {/* USP */}
          <div className="space-y-2">
            <Label>نقطة البيع الفريدة</Label>
            <Input
              value={uniqueSellingPoint}
              onChange={(e) => setUniqueSellingPoint(e.target.value)}
              placeholder="ما الذي يميز هذا المنتج؟"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label>رابط الصورة</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              dir="ltr"
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>المميزات</Label>
            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="أضف ميزة"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button type="button" variant="secondary" size="icon" onClick={handleAddFeature}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature) => (
                  <Badge
                    key={feature}
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => handleRemoveFeature(feature)}
                  >
                    {feature}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim() || !nameAr.trim()}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                {isEdit ? 'جاري التحديث...' : 'جاري الإضافة...'}
              </>
            ) : (
              isEdit ? 'تحديث' : 'إضافة'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
