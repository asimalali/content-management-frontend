import { useEffect } from 'react';
import { useBrandColors, useBrandMeta } from '@/hooks/use-brand';

interface BrandProviderProps {
  children: React.ReactNode;
}

/**
 * BrandProvider injects brand colors as CSS variables at runtime.
 * This allows dynamic theming without rebuilding the app.
 *
 * Wrap your app with this provider to enable dynamic brand colors.
 */
export function BrandProvider({ children }: BrandProviderProps) {
  const colors = useBrandColors();
  const meta = useBrandMeta();

  // Inject CSS variables for brand colors
  useEffect(() => {
    const root = document.documentElement;

    // Set primary color (overrides the default from CSS)
    root.style.setProperty('--primary', colors.primary);

    // For dark mode, we could set a different color if needed
    // This is handled by the CSS :root and .dark selectors
  }, [colors]);

  // Update document title dynamically
  useEffect(() => {
    document.title = meta.title;
  }, [meta.title]);

  return <>{children}</>;
}
