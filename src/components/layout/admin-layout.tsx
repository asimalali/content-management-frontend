import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for admin pages.
 * Includes admin sidebar and header.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-mr-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
