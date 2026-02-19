import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminPlans } from '@/features/admin/hooks/use-admin-plans';
import type { AdminPlan } from '@/features/admin/types';

/**
 * Admin Feature Definitions Page — ADMIN.05
 *
 * Shows a cross-plan matrix of all plan features (feature definitions):
 * rows = unique feature keys, columns = plans, cells = value per plan.
 * Read-only view — editing is done via the Plans page.
 */
export default function AdminFeatureDefinitionsPage() {
  const { data: plans, isLoading, error } = useAdminPlans(true);

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
        <p className="text-sm text-red-700">Failed to load feature definitions</p>
      </div>
    );
  }

  const activePlans = (plans ?? []).filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  // Aggregate all unique feature keys across all plans
  const featureMap = new Map<string, { displayName: string; description?: string }>();
  for (const plan of plans ?? []) {
    for (const f of plan.features) {
      if (!featureMap.has(f.featureKey)) {
        featureMap.set(f.featureKey, { displayName: f.displayName, description: f.description });
      }
    }
  }
  const featureKeys = Array.from(featureMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Helper: get feature value for a given plan + key
  const getFeatureValue = (plan: AdminPlan, key: string): string | null => {
    const feature = plan.features.find((f) => f.featureKey === key);
    return feature?.featureValue ?? null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Feature Definitions</h1>
        <p className="text-muted-foreground">
          Cross-plan view of all subscription plan features and their configured values.
        </p>
      </div>

      {featureKeys.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No feature definitions found</p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Feature Matrix</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 text-right font-medium text-muted-foreground min-w-[160px]">
                    Feature
                  </th>
                  {activePlans.map((plan) => (
                    <th key={plan.id} className="py-2 px-3 text-center font-medium min-w-[100px]">
                      {plan.name}
                      {!plan.isActive && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureKeys.map(([key, meta]) => (
                  <tr key={key} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{meta.displayName}</div>
                      <code className="text-xs text-muted-foreground">{key}</code>
                      {meta.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                      )}
                    </td>
                    {activePlans.map((plan) => {
                      const val = getFeatureValue(plan, key);
                      return (
                        <td key={plan.id} className="py-3 px-3 text-center">
                          {val === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : val === 'true' ? (
                            <Badge variant="default" className="text-xs">نعم</Badge>
                          ) : val === 'false' ? (
                            <Badge variant="secondary" className="text-xs">لا</Badge>
                          ) : (
                            <span className="font-medium">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        To edit feature values, navigate to the{' '}
        <a href="/admin/plans" className="underline hover:text-foreground">Plans</a> page.
      </p>
    </div>
  );
}
