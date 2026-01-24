import { QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch, Redirect } from 'wouter';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { queryClient } from '@/lib/query-client';
import { useAuth } from '@/features/auth';
import { AppLayout } from '@/components/layout/app-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { AdminRoute } from '@/components/admin-route';
import { Skeleton } from '@/components/ui/skeleton';

// Pages
import LandingPage from '@/pages/landing';
import AuthPage from '@/pages/auth';
import DashboardPage from '@/pages/dashboard';
import ProjectsPage from '@/pages/projects';
import ProjectFormPage from '@/pages/project-form';
import TemplatesPage from '@/pages/templates';
import ContentCreatePage from '@/pages/content-create';
import ContentLibraryPage from '@/pages/content-library';
import PlansPage from '@/pages/plans';
import SettingsPage from '@/pages/settings';
import OAuthCallbackPage from '@/pages/settings/oauth-callback';
import PublishPage from '@/pages/publish';
import PostsPage from '@/pages/posts';

// Admin Pages
import AdminDashboardPage from '@/pages/admin';
import AdminUsersPage from '@/pages/admin/users';
import AdminCreditsPage from '@/pages/admin/credits';
import AdminPlansPage from '@/pages/admin/plans';

// Public Route wrapper - redirects authenticated users to dashboard
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  return (
    <Switch>
      {/* Public landing page */}
      <Route path="/">
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      </Route>

      {/* Auth route */}
      <Route path="/auth" component={AuthPage} />

      {/* Dashboard - protected */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>

      {/* Protected routes - more specific paths first */}
      <Route path="/projects/new">
        <ProtectedRoute>
          <ProjectFormPage />
        </ProtectedRoute>
      </Route>

      <Route path="/projects/:id/edit">
        <ProtectedRoute>
          <ProjectFormPage />
        </ProtectedRoute>
      </Route>

      <Route path="/projects">
        <ProtectedRoute>
          <ProjectsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/templates">
        <ProtectedRoute>
          <TemplatesPage />
        </ProtectedRoute>
      </Route>

      <Route path="/create">
        <ProtectedRoute>
          <ContentCreatePage />
        </ProtectedRoute>
      </Route>

      <Route path="/library">
        <ProtectedRoute>
          <ContentLibraryPage />
        </ProtectedRoute>
      </Route>

      <Route path="/settings/oauth/callback">
        <ProtectedRoute>
          <OAuthCallbackPage />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/plans">
        <ProtectedRoute>
          <PlansPage />
        </ProtectedRoute>
      </Route>

      <Route path="/publish">
        <ProtectedRoute>
          <PublishPage />
        </ProtectedRoute>
      </Route>

      <Route path="/posts">
        <ProtectedRoute>
          <PostsPage />
        </ProtectedRoute>
      </Route>

      {/* Admin routes */}
      <Route path="/admin/users">
        <AdminRoute>
          <AdminLayout>
            <AdminUsersPage />
          </AdminLayout>
        </AdminRoute>
      </Route>

      <Route path="/admin/credits">
        <AdminRoute>
          <AdminLayout>
            <AdminCreditsPage />
          </AdminLayout>
        </AdminRoute>
      </Route>

      <Route path="/admin/plans">
        <AdminRoute>
          <AdminLayout>
            <AdminPlansPage />
          </AdminLayout>
        </AdminRoute>
      </Route>

      <Route path="/admin">
        <AdminRoute>
          <AdminLayout>
            <AdminDashboardPage />
          </AdminLayout>
        </AdminRoute>
      </Route>

    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="content-platform-theme">
        <Router>
          <AppRoutes />
        </Router>
        <Toaster position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
