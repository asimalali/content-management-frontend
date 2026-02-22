import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  ArrowRight,
  Flag,
  BookOpen,
  Receipt,
  Brain,
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
import { useFeatureFlag } from '@/features/config/hooks/use-feature-flag';

interface AdminMenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  featureFlag?: string;
}

const adminMenuItems: AdminMenuItem[] = [
  { title: 'لوحة التحكم', url: '/admin', icon: LayoutDashboard, featureFlag: 'admin_panel' },
  { title: 'المستخدمين', url: '/admin/users', icon: Users, featureFlag: 'admin_users' },
  { title: 'الأرصدة', url: '/admin/credits', icon: CreditCard, featureFlag: 'admin_credits' },
  { title: 'الباقات', url: '/admin/plans', icon: Package, featureFlag: 'admin_plans' },
  { title: 'المدفوعات', url: '/admin/payments', icon: Receipt },
  { title: 'خصائص المنصة', url: '/admin/feature-flags', icon: Flag },
  { title: 'تعريفات الخصائص', url: '/admin/feature-definitions', icon: BookOpen },
  { title: 'مزودي الذكاء الاصطناعي', url: '/admin/ai-providers', icon: Brain },
];

function GatedAdminMenuItem({ item, isActive }: { item: AdminMenuItem; isActive: boolean }) {
  const { isEnabled, isLoading } = useFeatureFlag(item.featureFlag ?? '');

  if (!item.featureFlag) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <Link href={item.url}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (isLoading || !isEnabled) return null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.url}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

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
                <GatedAdminMenuItem
                  key={item.url}
                  item={item}
                  isActive={location === item.url}
                />
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
