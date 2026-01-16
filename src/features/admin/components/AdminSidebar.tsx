import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  ArrowRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

const adminMenuItems = [
  { title: 'لوحة التحكم', url: '/admin', icon: LayoutDashboard },
  { title: 'المستخدمين', url: '/admin/users', icon: Users },
  { title: 'الأرصدة', url: '/admin/credits', icon: CreditCard },
  { title: 'الباقات', url: '/admin/plans', icon: Package },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <h2 className="text-lg font-semibold">لوحة المدير</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>الإدارة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="العودة للتطبيق">
              <Link href="/">
                <ArrowRight className="h-4 w-4" />
                <span>العودة للتطبيق</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
