import { useAdminPayments, type AdminPaymentRecord } from '@/features/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

function statusVariant(status: AdminPaymentRecord['status']) {
  switch (status) {
    case 'Succeeded':
      return 'default' as const;
    case 'Pending':
      return 'secondary' as const;
    case 'Failed':
      return 'destructive' as const;
    case 'Refunded':
      return 'outline' as const;
  }
}

function statusLabel(status: AdminPaymentRecord['status']) {
  switch (status) {
    case 'Succeeded':
      return 'ناجح';
    case 'Pending':
      return 'قيد الانتظار';
    case 'Failed':
      return 'فاشل';
    case 'Refunded':
      return 'مسترد';
  }
}

function typeLabel(type: AdminPaymentRecord['type']) {
  switch (type) {
    case 'Subscription':
      return 'اشتراك';
    case 'OneTime':
      return 'دفعة واحدة';
    case 'Refund':
      return 'استرداد';
  }
}

export default function AdminPaymentsPage() {
  const { data: payments, isLoading } = useAdminPayments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المدفوعات</h1>
        <p className="text-muted-foreground">عرض سجلات المدفوعات</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !payments?.length ? (
            <div className="py-8 text-center text-muted-foreground">
              لا توجد مدفوعات
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المزود</TableHead>
                  <TableHead>معرف المعاملة</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium capitalize">
                      {payment.provider}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.externalTransactionId || '—'}
                    </TableCell>
                    <TableCell>
                      {payment.amount.toFixed(2)} {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(payment.status)}>
                        {statusLabel(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{typeLabel(payment.type)}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {payment.description || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
