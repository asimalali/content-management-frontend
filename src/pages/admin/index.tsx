import { useAdminDashboard } from '@/features/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  CreditCard,
  FileText,
  Send,
  DollarSign,
  Activity,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'المستخدمين النشطين',
      value: stats?.activeUsers ?? 0,
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: 'الاشتراكات النشطة',
      value: stats?.totalSubscriptions ?? 0,
      icon: CreditCard,
      color: 'text-purple-500',
    },
    {
      title: 'الإيرادات الشهرية',
      value: `$${stats?.monthlyRevenue?.toFixed(2) ?? '0.00'}`,
      icon: DollarSign,
      color: 'text-yellow-500',
    },
    {
      title: 'المحتوى المُنشأ',
      value: stats?.contentGenerated ?? 0,
      icon: FileText,
      color: 'text-orange-500',
    },
    {
      title: 'المنشورات',
      value: stats?.postsPublished ?? 0,
      icon: Send,
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة تحكم المدير</h1>
        <p className="text-muted-foreground">
          نظرة عامة على إحصائيات المنصة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
