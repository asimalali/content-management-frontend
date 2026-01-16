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

  return <>{children}</>;
}
