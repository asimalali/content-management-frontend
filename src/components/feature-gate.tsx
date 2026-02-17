import { useFeatureFlag, usePlatformEnabled } from '@/features/config/hooks/use-feature-flag';

/**
 * FeatureGate component for conditional rendering based on feature flags.
 * Hides content if the feature is not enabled.
 *
 * @param feature - The feature flag key
 * @param children - Content to show if feature is enabled
 * @param fallback - Content to show if feature is disabled (default: null)
 *
 * @example
 * <FeatureGate feature="projects">
 *   <ProjectsPage />
 * </FeatureGate>
 *
 * @example
 * <FeatureGate feature="publishing" fallback={<div>Coming soon</div>}>
 *   <PublishPage />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isEnabled, isLoading } = useFeatureFlag(feature);

  // During loading, return nothing (or skeleton if needed)
  if (isLoading) {
    return null;
  }

  // Show fallback if feature is disabled
  if (!isEnabled) {
    return <>{fallback}</>;
  }

  // Show children if feature is enabled
  return <>{children}</>;
}

/**
 * PlatformGate component for conditional rendering based on platform availability.
 * Hides content if the platform is not enabled (e.g., Facebook, TikTok in V1).
 *
 * @param platform - The platform name (e.g., "X", "Instagram")
 * @param children - Content to show if platform is enabled
 * @param fallback - Content to show if platform is disabled (default: null)
 *
 * @example
 * <PlatformGate platform="X">
 *   <XPublishingComponent />
 * </PlatformGate>
 *
 * @example
 * <PlatformGate platform="Facebook" fallback={<div>Coming in V2</div>}>
 *   <FacebookPublishingComponent />
 * </PlatformGate>
 */
export function PlatformGate({
  platform,
  children,
  fallback = null,
}: {
  platform: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isEnabled, isLoading } = usePlatformEnabled(platform);

  // During loading, return nothing
  if (isLoading) {
    return null;
  }

  // Show fallback if platform is disabled
  if (!isEnabled) {
    return <>{fallback}</>;
  }

  // Show children if platform is enabled
  return <>{children}</>;
}
