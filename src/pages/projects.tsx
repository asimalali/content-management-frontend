import { useState } from 'react';
import { Link } from 'wouter';
import { Plus, MoreHorizontal, Pencil, Trash2, FolderKanban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useProjects, useDeleteProject, type Project } from '@/features/projects';
import { toast } from 'sonner';

function ProjectCard({
  project,
  onDelete,
  isDeleting,
}: {
  project: Project;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const colors = ['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
  const colorIndex = project.name.length % colors.length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${colors[colorIndex]} flex items-center justify-center text-white font-bold`}>
            {project.name.charAt(0)}
          </div>
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription>{project.industry}</CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}/edit`}>
                <Pencil className="ml-2 h-4 w-4" />
                تعديل
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || 'لا يوجد وصف'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {project.brandName}
        </p>
      </CardContent>
    </Card>
  );
}

function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FolderKanban className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        ابدأ بإنشاء مشروعك الأول لتنظيم وإدارة محتواك بشكل أفضل
      </p>
      <Button asChild>
        <Link href="/projects/new">
          <Plus className="ml-2 h-4 w-4" />
          إنشاء مشروع
        </Link>
      </Button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <FolderKanban className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">حدث خطأ</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        تعذر تحميل المشاريع. يرجى المحاولة مرة أخرى.
      </p>
      <Button onClick={onRetry} variant="outline">
        إعادة المحاولة
      </Button>
    </div>
  );
}

export default function ProjectsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch projects from API
  const { data: projects, isLoading, isError, refetch } = useProjects();

  // Delete mutation
  const deleteProject = useDeleteProject();

  const handleDelete = () => {
    if (!deleteId) return;

    deleteProject.mutate(deleteId, {
      onSuccess: () => {
        toast.success('تم حذف المشروع بنجاح');
        setDeleteId(null);
      },
      onError: () => {
        toast.error('فشل حذف المشروع');
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المشاريع</h1>
          <p className="text-muted-foreground">
            إدارة مشاريعك وهوياتك التجارية
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="ml-2 h-4 w-4" />
            مشروع جديد
          </Link>
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !projects || projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => setDeleteId(project.id)}
              isDeleting={deleteProject.isPending && deleteId === project.id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا المشروع وجميع المحتويات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProject.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : null}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
