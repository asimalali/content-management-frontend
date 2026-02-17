import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ElementType;
  };
  variant?: 'default' | 'error';
  onRetry?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  onRetry,
}: EmptyStateProps) {
  const bgClass = variant === 'error' ? 'bg-destructive/10' : 'bg-muted';
  const iconClass = variant === 'error' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className={`rounded-full ${bgClass} p-4 mb-4`}>
        <Icon className={`h-8 w-8 ${iconClass}`} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>
            {action.icon && <action.icon className="ml-2 h-4 w-4" />}
            {action.label}
          </Link>
        </Button>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
