import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, FileText, Sparkles, TrendingUp, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/features/projects';
import { useContentList } from '@/features/content';
import { useCreditBalance } from '@/features/credits';
import { BrandName } from '@/components/brand-name';

// Stats card component
function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function RecentContentItem({
  title,
  templateName,
  createdAt,
}: {
  title: string;
  templateName: string;
  createdAt: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-medium text-sm">{title || 'محتوى بدون عنوان'}</p>
        <p className="text-xs text-muted-foreground">{templateName}</p>
      </div>
      <span className="text-xs text-muted-foreground">
        {new Date(createdAt).toLocaleDateString('ar-SA')}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  // Fetch data from APIs
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: contents, isLoading: isLoadingContents } = useContentList();
  const { data: creditBalance, isLoading: isLoadingCredits } = useCreditBalance();

  const isLoading = isLoadingProjects || isLoadingContents || isLoadingCredits;

  const stats = {
    projects: projects?.length || 0,
    content: contents?.length || 0,
    creditsUsed: creditBalance?.used || 0,
    creditsTotal: creditBalance?.allocated || 0,
    creditsBalance: creditBalance?.available || 0,
  };

  // Get recent content (last 5)
  const recentContent = contents?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground">
          مرحباً بك في <BrandName variant="short" />
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="المشاريع"
              value={stats.projects}
              description="مشاريع نشطة"
              icon={FolderKanban}
            />
            <StatsCard
              title="المحتوى المنشأ"
              value={stats.content}
              description="قطعة محتوى"
              icon={FileText}
            />
            <StatsCard
              title="الرصيد المتبقي"
              value={stats.creditsBalance}
              description="وحدة متاحة"
              icon={Coins}
            />
            <StatsCard
              title="الوحدات المستخدمة"
              value={stats.creditsUsed}
              description="وحدة مستهلكة"
              icon={Sparkles}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/create">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                إنشاء محتوى جديد
              </CardTitle>
              <CardDescription>
                استخدم الذكاء الاصطناعي لإنشاء محتوى احترافي
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/projects/new">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                إنشاء مشروع
              </CardTitle>
              <CardDescription>
                أضف مشروعاً جديداً لتنظيم محتواك
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/templates">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                تصفح القوالب
              </CardTitle>
              <CardDescription>
                اختر من مكتبة القوالب الجاهزة
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>آخر المحتويات المنشأة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingContents ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد نشاط حتى الآن. ابدأ بإنشاء محتوى جديد!
            </div>
          ) : (
            <div>
              {recentContent.map((item) => (
                <RecentContentItem
                  key={item.id}
                  title={item.title}
                  templateName={item.templateName}
                  createdAt={item.createdAt}
                />
              ))}
              {contents && contents.length > 5 && (
                <Link href="/library" className="block text-center text-sm text-primary hover:underline mt-4">
                  عرض كل المحتوى ({contents.length})
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
