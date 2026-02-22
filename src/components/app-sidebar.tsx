import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Library,
  Sparkles,
  Settings,
  CreditCard,
  Send,
  MessageSquare,
  Loader2,
  Shield,
  CalendarDays,
  Lock,
  Image as ImageIcon,
} from 'lucide-react';
import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { LOW_CREDIT_THRESHOLD } from '@/config/constants';
import { BrandLogo } from '@/components/brand-logo';
import { BrandName, BrandTagline } from '@/components/brand-name';
import { useAuth } from '@/features/auth';
import { useFeatureFlag } from '@/features/config/hooks/use-feature-flag';
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
import { Progress } from '@/components/ui/progress';
import { useCreditBalance } from '@/features/credits';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  featureFlag?: string;
}

const menuItems: MenuItem[] = [
  { title: 'لوحة التحكم', url: '/dashboard', icon: LayoutDashboard },
  { title: 'المشاريع', url: '/projects', icon: FolderKanban, featureFlag: 'projects' },
  { title: 'القوالب', url: '/templates', icon: FileText, featureFlag: 'templates' },
  { title: 'إنشاء محتوى', url: '/create', icon: Sparkles, featureFlag: 'content_generation' },
  { title: 'إنشاء صورة', url: '/generate-image', icon: ImageIcon, featureFlag: 'image_generation' },
  { title: 'مكتبة المحتوى', url: '/library', icon: Library, featureFlag: 'content_library' },
  { title: 'تقويم المحتوى', url: '/calendar', icon: CalendarDays, featureFlag: 'content_calendar' },
  { title: 'نشر محتوى', url: '/publish', icon: Send, featureFlag: 'publishing' },
  { title: 'المنشورات', url: '/posts', icon: MessageSquare, featureFlag: 'publishing' },
  { title: 'الباقات', url: '/plans', icon: CreditCard, featureFlag: 'subscription_plans' },
  { title: 'الإعدادات', url: '/settings', icon: Settings },
];

function GatedMenuItem({ item, isActive }: { item: MenuItem; isActive: boolean }) {
  const { isEnabled, isComingSoon, isLoading } = useFeatureFlag(item.featureFlag ?? '');

  // Items without a feature flag are always shown
  if (!item.featureFlag) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <Link href={item.url}>
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Hide if loading or fully disabled (not coming-soon)
  if (isLoading || (!isEnabled && !isComingSoon)) return null;

  // Show enabled item
  if (isEnabled) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <Link href={item.url}>
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Show locked / coming-soon item
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        className="opacity-50 cursor-not-allowed pointer-events-none"
      >
        <Lock className="h-5 w-5" />
        <span className="flex-1">{item.title}</span>
        <ComingSoonBadge />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { isAdmin } = useAuth();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();

  // Use actual data or defaults while loading
  const totalAllocated = creditBalance?.allocated ?? 0;
  const totalUsed = creditBalance?.used ?? 0;
  const remainingCredits = creditBalance?.available ?? 0;
  const usagePercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-bold">
              <BrandName variant="short" />
            </h2>
            <BrandTagline className="text-xs text-muted-foreground" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <GatedMenuItem
                  key={item.url}
                  item={item}
                  isActive={location === item.url}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>الإدارة</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.startsWith('/admin')}
                    tooltip="لوحة المدير"
                  >
                    <Link href="/admin">
                      <Shield className="h-5 w-5" />
                      <span>لوحة المدير</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-lg bg-muted p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">رصيد المحتوى</span>
          </div>
          {isLoadingCredits ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              <Progress value={100 - usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{remainingCredits} متبقية</span>
                <span>من {totalAllocated}</span>
              </div>
            </div>
          )}
          {!isLoadingCredits && remainingCredits <= LOW_CREDIT_THRESHOLD && totalAllocated > 0 && (
            <Link href="/plans" className="text-xs text-destructive mt-2 block hover:underline">
              رصيدك منخفض! قم بترقية باقتك
            </Link>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
