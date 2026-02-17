import { Suspense } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard component that protects admin-only routes.
 * Redirects unauthenticated users to /auth and non-admins to /.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Suspense fallback={
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}
