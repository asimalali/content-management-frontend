import { useConfig } from './use-config';

/**
 * Hook to check if a feature flag is enabled.
 * Uses config cache with 10-minute TTL.
 *
 * @param flagKey - The flag key (e.g., "projects", "publishing")
 * @returns { isEnabled, isLoading }
 *
 * @example
 * const { isEnabled, isLoading } = useFeatureFlag("projects");
 * if (!isLoading && isEnabled) {
 *   return <ProjectsPage />;
 * }
 */
export function useFeatureFlag(flagKey: string): {
  isEnabled: boolean;
  isComingSoon: boolean;
  isLoading: boolean;
} {
  const { data: config, isLoading } = useConfig();

  return {
    isEnabled: config?.features?.[flagKey] ?? false,
    isComingSoon: config?.comingSoonFeatures?.includes(flagKey) ?? false,
    isLoading,
  };
}

/**
 * Hook to check if a specific platform is enabled.
 * Checks if the platform is in the enabledPlatforms list.
 *
 * @param platform - The platform name (e.g., "X", "Instagram")
 * @returns { isEnabled, isLoading }
 *
 * @example
 * const { isEnabled } = usePlatformEnabled("X");
 * if (isEnabled) {
 *   return <XPublishingComponent />;
 * }
 */
export function usePlatformEnabled(platform: string): {
  isEnabled: boolean;
  isComingSoon: boolean;
  isLoading: boolean;
} {
  const { data: config, isLoading } = useConfig();

  return {
    isEnabled: config?.enabledPlatforms?.includes(platform) ?? false,
    isComingSoon: config?.comingSoonPlatforms?.includes(platform) ?? false,
    isLoading,
  };
}

/**
 * Hook to get all enabled platforms.
 * Returns an array of platform names.
 *
 * @returns { platforms, isLoading }
 *
 * @example
 * const { platforms, isLoading } = useEnabledPlatforms();
 * return platforms.map(platform => (
 *   <PlatformOption key={platform} platform={platform} />
 * ));
 */
export function useEnabledPlatforms() {
  const { data: config, isLoading } = useConfig();

  return {
    platforms: config?.enabledPlatforms ?? [],
    comingSoonPlatforms: config?.comingSoonPlatforms ?? [],
    isLoading,
  };
}
