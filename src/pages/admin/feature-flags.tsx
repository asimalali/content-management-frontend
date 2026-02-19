import { useState } from 'react';
import { useFeatureFlags, useUpdateFeatureFlag } from '@/features/admin/hooks/use-feature-flags';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  FeatureFlagStatusControl,
  type FeatureFlagStatus,
} from '@/components/feature-flag-status-control';

export default function AdminFeatureFlagsPage() {
  const { data: flags, isLoading, error } = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">Failed to load feature flags</p>
      </div>
    );
  }

  // Group flags by category
  const groupedFlags = flags?.reduce(
    (acc, flag) => {
      if (!acc[flag.category]) acc[flag.category] = [];
      acc[flag.category].push(flag);
      return acc;
    },
    {} as Record<string, typeof flags>
  );

  const categories = Object.keys(groupedFlags || {}).sort();

  const getFeatureFlagState = (flag: {
    isEnabled: boolean;
    isComingSoon: boolean;
  }): FeatureFlagStatus => {
    if (flag.isEnabled) return 'enabled';
    if (flag.isComingSoon) return 'comingSoon';
    return 'hidden';
  };

  const handleStateChange = async (flagKey: string, newState: FeatureFlagStatus) => {
    await updateFlag.mutateAsync({
      flagKey,
      data: {
        isEnabled: newState === 'enabled',
        isComingSoon: newState === 'comingSoon',
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Feature Flags Management</h1>
        <p className="text-muted-foreground">
          Control platform features dynamically without deployments
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'border border-input bg-background hover:bg-accent'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'border border-input bg-background hover:bg-accent'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Feature Flags by Category */}
      {categories.map((category) => {
        // Skip category if filter is active and doesn't match
        if (selectedCategory && selectedCategory !== category) {
          return null;
        }

        const categoryFlags = groupedFlags?.[category] || [];

        return (
          <Card key={category} className="p-6">
            <h2 className="mb-4 text-lg font-semibold capitalize">
              {category.replace(/_/g, ' ')}
            </h2>

            <div className="space-y-4">
              {categoryFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{flag.displayName}</span>
                      {flag.isSystemFlag && (
                        <Badge variant="secondary" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {flag.description}
                    </p>
                    <code className="mt-1 block text-xs text-muted-foreground">
                      {flag.flagKey}
                    </code>

                    {/* Platform Settings */}
                    {flag.flagType === 'platform_specific' &&
                      flag.platformSettings && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(flag.platformSettings).map(
                            ([platform, enabled]) => (
                              <div
                                key={platform}
                                className="text-xs text-muted-foreground"
                              >
                                {platform}:{' '}
                                <span className={enabled ? 'text-green-600' : 'text-red-600'}>
                                  {enabled ? 'enabled' : 'disabled'}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>

                  <FeatureFlagStatusControl
                    currentState={getFeatureFlagState(flag)}
                    onChange={(newState) =>
                      handleStateChange(flag.flagKey, newState)
                    }
                    disabled={updateFlag.isPending}
                  />
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* No flags message */}
      {flags?.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No feature flags found</p>
        </Card>
      )}
    </div>
  );
}
