import { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUploadMedia, useMedia, useDeleteMedia } from '../hooks/use-media';
import { formatFileSize, getMediaType, type MediaAsset } from '../types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  onSelect?: (media: MediaAsset) => void;
  selectedIds?: string[];
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export function MediaUploader({
  onSelect,
  selectedIds = [],
  maxFiles = 10,
  accept = 'image/*,video/*',
  className,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const { data: mediaList, isLoading } = useMedia();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast.error(`${file.name} نوع ملف غير مدعوم`);
      }
      return isValid;
    });

    if (validFiles.length + (mediaList?.length || 0) > maxFiles) {
      toast.error(`الحد الأقصى ${maxFiles} ملفات`);
      return;
    }

    validFiles.forEach((file) => {
      uploadMedia.mutate(file, {
        onSuccess: () => {
          toast.success(`تم رفع ${file.name}`);
        },
        onError: () => {
          toast.error(`فشل رفع ${file.name}`);
        },
      });
    });
  };

  const handleDelete = (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMedia.mutate(mediaId, {
      onSuccess: () => {
        toast.success('تم حذف الملف');
      },
      onError: () => {
        toast.error('فشل حذف الملف');
      },
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          uploadMedia.isPending && 'pointer-events-none opacity-50'
        )}
        onClick={() => document.getElementById('media-upload-input')?.click()}
      >
        <input
          id="media-upload-input"
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploadMedia.isPending}
        />

        {uploadMedia.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري الرفع...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">اسحب الملفات هنا أو انقر للرفع</p>
            <p className="text-xs text-muted-foreground">
              الأنواع المدعومة: صور وفيديو (حد أقصى 100MB)
            </p>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : mediaList && mediaList.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {mediaList.map((media) => {
            const isSelected = selectedIds.includes(media.id);
            const mediaType = getMediaType(media.mimeType);

            return (
              <Card
                key={media.id}
                className={cn(
                  'relative cursor-pointer overflow-hidden transition-all',
                  isSelected && 'ring-2 ring-primary',
                  onSelect && 'hover:ring-1 hover:ring-primary/50'
                )}
                onClick={() => onSelect?.(media)}
              >
                <CardContent className="p-0 aspect-square">
                  {mediaType === 'video' ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={media.fileName}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 left-1 h-6 w-6"
                    onClick={(e) => handleDelete(media.id, e)}
                    disabled={deleteMedia.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Info Badge */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                    <p className="text-[10px] text-white truncate">{media.fileName}</p>
                    <p className="text-[10px] text-white/70">{formatFileSize(media.sizeBytes)}</p>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Image className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          لا توجد ملفات مرفوعة بعد
        </p>
      )}
    </div>
  );
}
