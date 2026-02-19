import { useFeatureFlag, usePlatformEnabled } from '@/features/config/hooks/use-feature-flag';

/**
 * FeatureGate component for conditional rendering based on feature flags.
 * Supports three states: enabled, coming-soon (locked), and disabled (hidden).
 *
 * @param feature - The feature flag key
 * @param children - Content to show if feature is enabled
 * @param fallback - Content to show if feature is disabled (default: null)
 * @param comingSoonFallback - Content to show if feature is coming soon (default: null)
 *
 * @example
 * <FeatureGate feature="projects">
 *   <ProjectsPage />
 * </FeatureGate>
 *
 * @example
 * <FeatureGate feature="publishing" comingSoonFallback={<LockedCard />}>
 *   <PublishPage />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
  comingSoonFallback = null,
}: {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  comingSoonFallback?: React.ReactNode;
}) {
  const { isEnabled, isComingSoon, isLoading } = useFeatureFlag(feature);

  if (isLoading) return null;

  if (isEnabled) return <>{children}</>;

  if (isComingSoon) return <>{comingSoonFallback}</>;

  return <>{fallback}</>;
}

/**
 * PlatformGate component for conditional rendering based on platform availability.
 * Supports three states: enabled, coming-soon (locked), and disabled (hidden).
 *
 * @param platform - The platform name (e.g., "X", "Instagram")
 * @param children - Content to show if platform is enabled
 * @param fallback - Content to show if platform is disabled (default: null)
 * @param comingSoonFallback - Content to show if platform is coming soon (default: null)
 *
 * @example
 * <PlatformGate platform="X">
 *   <XPublishingComponent />
 * </PlatformGate>
 *
 * @example
 * <PlatformGate platform="Facebook" comingSoonFallback={<LockedPlatformCard ... />}>
 *   <FacebookPublishingComponent />
 * </PlatformGate>
 */
export function PlatformGate({
  platform,
  children,
  fallback = null,
  comingSoonFallback = null,
}: {
  platform: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  comingSoonFallback?: React.ReactNode;
}) {
  const { isEnabled, isComingSoon, isLoading } = usePlatformEnabled(platform);

  if (isLoading) return null;

  if (isEnabled) return <>{children}</>;

  if (isComingSoon) return <>{comingSoonFallback}</>;

  return <>{fallback}</>;
}
