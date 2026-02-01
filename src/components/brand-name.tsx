import { useBrandName, useBrandTagline } from '@/hooks/use-brand';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

type NameVariant = 'short' | 'display';

interface BrandNameProps {
  variant?: NameVariant;
  className?: string;
}

/**
 * BrandName component displays the application name.
 * Automatically uses the correct language based on user preference.
 *
 * Variants:
 * - 'short': Shows just the name in current language (سَـرْد or Sard)
 * - 'display': Shows the full display format (سَـرْد | Sard)
 *
 * Usage:
 * ```tsx
 * <BrandName variant="short" className="font-bold" />
 * <BrandName variant="display" />
 * ```
 */
export function BrandName({ variant = 'short', className }: BrandNameProps) {
  const name = useBrandName();
  const { language } = useLanguage();

  const text = variant === 'display' ? name.display : name[language];

  return <span className={cn(className)}>{text}</span>;
}

interface BrandTaglineProps {
  className?: string;
}

/**
 * BrandTagline component displays the application tagline.
 * Automatically uses the correct language based on user preference.
 *
 * Usage:
 * ```tsx
 * <BrandTagline className="text-muted-foreground" />
 * ```
 */
export function BrandTagline({ className }: BrandTaglineProps) {
  const tagline = useBrandTagline();
  const { language } = useLanguage();

  return <span className={cn(className)}>{tagline[language]}</span>;
}
