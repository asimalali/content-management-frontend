import { useState } from 'react';
import {
  useAdminUsers,
  useSuspendUser,
  useActivateUser,
  type AdminUserQuery,
  type AdminUser,
} from '@/features/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, UserX, UserCheck, ChevronRight, ChevronLeft } from 'lucide-react';

export default function AdminUsersPage() {
  const [query, setQuery] = useState<AdminUserQuery>({
    page: 1,
    pageSize: 20,
    sortBy: 'CreatedAt',
    sortDescending: true,
  });

  const { data, isLoading } = useAdminUsers(query);
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

  const handleSuspend = async (user: AdminUser) => {
    try {
      await suspendUser.mutateAsync({ userId: user.id, reason: 'Admin action' });
      toast.success('تم تعليق المستخدم بنجاح');
    } catch {
      toast.error('فشل تعليق المستخدم');
    }
  };

  const handleActivate = async (user: AdminUser) => {
    try {
      await activateUser.mutateAsync(user.id);
      toast.success('تم تفعيل المستخدم بنجاح');
    } catch {
      toast.error('فشل تفعيل المستخدم');
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'Admin' ? (
      <Badge variant="default">مدير</Badge>
    ) : (
      <Badge variant="secondary">مستخدم</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default">نشط</Badge>;
      case 'Suspended':
        return <Badge variant="destructive">معلق</Badge>;
      case 'Deleted':
        return <Badge variant="outline">محذوف</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground">عرض وإدارة حسابات المستخدمين</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المستخدمين ({data?.totalCount ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالبريد أو الاسم..."
                className="pr-10"
                value={query.search || ''}
                onChange={(e) =>
                  setQuery({ ...query, search: e.target.value, page: 1 })
                }
              />
            </div>
            <Select
              value={query.status || 'all'}
              onValueChange={(value) =>
                setQuery({
                  ...query,
                  status: value === 'all' ? undefined : (value as 'Active' | 'Suspended'),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="Active">نشط</SelectItem>
                <SelectItem value="Suspended">معلق</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={query.role || 'all'}
              onValueChange={(value) =>
                setQuery({
                  ...query,
                  role: value === 'all' ? undefined : (value as 'User' | 'Admin'),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="User">مستخدم</SelectItem>
                <SelectItem value="Admin">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead className="w-24">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا يوجد مستخدمين
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.fullName || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.credits?.available ?? 0}</TableCell>
                      <TableCell>
                        {user.role !== 'Admin' && (
                          user.status === 'Active' ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleSuspend(user)}
                              disabled={suspendUser.isPending}
                              title="تعليق"
                            >
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleActivate(user)}
                              disabled={activateUser.isPending}
                              title="تفعيل"
                            >
                              <UserCheck className="h-4 w-4 text-green-500" />
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={query.page === 1}
                onClick={() => setQuery({ ...query, page: (query.page ?? 1) - 1 })}
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
              <span className="text-sm text-muted-foreground">
                صفحة {query.page} من {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={query.page === data.totalPages}
                onClick={() => setQuery({ ...query, page: (query.page ?? 1) + 1 })}
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
