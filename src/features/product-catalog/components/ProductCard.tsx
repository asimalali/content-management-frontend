import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ProductCard({ product, onEdit, onDelete, isDeleting }: ProductCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base line-clamp-1">{product.nameAr || product.name}</CardTitle>
          <CardDescription className="line-clamp-1 mt-0.5">
            {product.name !== product.nameAr ? product.name : ''}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!product.isActive && (
            <Badge variant="secondary" className="text-xs">غير نشط</Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {product.descriptionAr && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.descriptionAr}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {product.price != null && (
            <Badge variant="outline">
              {product.price} {product.currency || 'SAR'}
            </Badge>
          )}
          {product.category && (
            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
          )}
        </div>
        {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 3).map((f) => (
              <Badge key={f} variant="outline" className="text-xs font-normal">{f}</Badge>
            ))}
            {product.features.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{product.features.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
