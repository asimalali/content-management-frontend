import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch, Redirect } from 'wouter';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { BrandProvider } from '@/components/brand-provider';
import { queryClient } from '@/lib/query-client';
import { useAuth } from '@/features/auth';
import { AppLayout } from '@/components/layout/app-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { AdminRoute } from '@/components/admin-route';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureGate } from '@/components/feature-gate';

// Eagerly loaded pages (entry points)
import LandingPage from '@/pages/landing';
import AuthPage from '@/pages/auth';

// Lazy loaded pages
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const ProjectsPage = lazy(() => import('@/pages/projects'));
const ProjectFormPage = lazy(() => import('@/pages/project-form'));
const TemplatesPage = lazy(() => import('@/pages/templates'));
const ContentCreatePage = lazy(() => import('@/pages/content-create'));
const ContentLibraryPage = lazy(() => import('@/pages/content-library'));
const PlansPage = lazy(() => import('@/pages/plans'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const OAuthCallbackPage = lazy(() => import('@/pages/settings/oauth-callback'));
const PublishPage = lazy(() => import('@/pages/publish'));
const PostsPage = lazy(() => import('@/pages/posts'));
const CalendarPage = lazy(() => import('@/pages/calendar'));

// Lazy loaded admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin'));
const AdminUsersPage = lazy(() => import('@/pages/admin/users'));
const AdminCreditsPage = lazy(() => import('@/pages/admin/credits'));
const AdminPlansPage = lazy(() => import('@/pages/admin/plans'));
const AdminFeatureFlagsPage = lazy(() => import('@/pages/admin/feature-flags'));

function PageSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-6 w-1/4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

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

  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </AppLayout>
  );
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
          <FeatureGate feature="projects">
            <ProjectFormPage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/projects/:id/edit">
        <ProtectedRoute>
          <FeatureGate feature="projects">
            <ProjectFormPage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/projects">
        <ProtectedRoute>
          <FeatureGate feature="projects">
            <ProjectsPage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/templates">
        <ProtectedRoute>
          <FeatureGate feature="templates">
            <TemplatesPage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/create">
        <ProtectedRoute>
          <FeatureGate feature="content_generation">
            <ContentCreatePage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/library">
        <ProtectedRoute>
          <FeatureGate feature="content_library">
            <ContentLibraryPage />
          </FeatureGate>
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
          <FeatureGate feature="subscription_plans">
            <PlansPage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/publish">
        <ProtectedRoute>
          <FeatureGate feature="publishing">
            <PublishPage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/posts">
        <ProtectedRoute>
          <FeatureGate feature="publishing">
            <PostsPage />
          </FeatureGate>
        </ProtectedRoute>
      </Route>

      <Route path="/calendar">
        <ProtectedRoute>
          <FeatureGate feature="content_calendar">
            <CalendarPage />
          </FeatureGate>
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

      <Route path="/admin/feature-flags">
        <AdminRoute>
          <AdminLayout>
            <AdminFeatureFlagsPage />
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
      <ThemeProvider defaultTheme="system" storageKey="sard-theme">
        <BrandProvider>
          <Router>
            <AppRoutes />
          </Router>
          <Toaster position="top-center" />
        </BrandProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
