import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Inline badge shown next to locked/coming-soon feature labels.
 * Renders a small amber "قريباً" pill with a lock icon.
 */
export function ComingSoonBadge() {
  return (
    <Badge
      variant="outline"
      className="text-xs px-1.5 py-0 h-5 border-amber-400 text-amber-600 bg-amber-50 gap-1 shrink-0"
    >
      <Lock className="h-2.5 w-2.5" />
      قريباً
    </Badge>
  );
}

/**
 * Locked platform card shown in the Settings "Connect Account" section.
 * Displays the platform icon and name with a lock overlay.
 */
export function LockedPlatformCard({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-muted/40 opacity-60 cursor-not-allowed justify-start">
      <span className="text-base">{icon}</span>
      <span className="text-sm font-medium flex-1">{name}</span>
      <ComingSoonBadge />
    </div>
  );
}
