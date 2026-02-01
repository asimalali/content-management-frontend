import { Sparkles } from 'lucide-react';
import { useBrandLogo } from '@/hooks/use-brand';
import { cn } from '@/lib/utils';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BrandLogoProps {
  size?: LogoSize;
  className?: string;
  showBackground?: boolean;
}

const sizeMap: Record<LogoSize, { container: string; icon: string }> = {
  xs: { container: 'h-6 w-6', icon: 'h-3 w-3' },
  sm: { container: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { container: 'h-10 w-10', icon: 'h-5 w-5' },
  lg: { container: 'h-12 w-12', icon: 'h-6 w-6' },
  xl: { container: 'h-16 w-16', icon: 'h-8 w-8' },
};

/**
 * BrandLogo component displays the application logo.
 * Supports SVG files, URLs, or falls back to Sparkles icon.
 *
 * Usage:
 * ```tsx
 * <BrandLogo size="md" />
 * <BrandLogo size="lg" showBackground={false} />
 * ```
 */
export function BrandLogo({
  size = 'md',
  className,
  showBackground = true,
}: BrandLogoProps) {
  const logo = useBrandLogo();
  const sizes = sizeMap[size];

  // SVG or URL-based logo
  if (logo.type === 'url' || logo.type === 'svg') {
    return (
      <div
        className={cn(
          sizes.container,
          'flex-shrink-0',
          showBackground && 'rounded-lg overflow-hidden',
          className
        )}
      >
        <img
          src={logo.value}
          alt="Logo"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  // Fallback to icon (Sparkles or configurable)
  return (
    <div
      className={cn(
        sizes.container,
        'flex items-center justify-center flex-shrink-0',
        showBackground && 'rounded-lg bg-primary text-primary-foreground',
        className
      )}
    >
      <Sparkles className={sizes.icon} />
    </div>
  );
}
