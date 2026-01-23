import { Instagram } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useDestinations, type ConnectedAccount, type Destination } from '@/features/integrations';

// Platform icons
const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  X: <span className="text-sm font-bold">𝕏</span>,
  Facebook: <span className="text-sm font-bold">f</span>,
  TikTok: <span className="text-sm">♪</span>,
};

const statusColors: Record<string, string> = {
  Connected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Revoked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export interface SelectedDestination {
  accountId: string;
  destinationId: string;
  accountName: string;
  platform: string;
}

interface DestinationSelectorProps {
  accounts: ConnectedAccount[];
  selectedDestinations: SelectedDestination[];
  onToggle: (account: ConnectedAccount, destination: Destination) => void;
  isLoading?: boolean;
}

export function DestinationSelector({
  accounts,
  selectedDestinations,
  onToggle,
  isLoading,
}: DestinationSelectorProps) {
  const isDestinationSelected = (accountId: string, destinationId: string) => {
    return selectedDestinations.some(
      d => d.accountId === accountId && d.destinationId === destinationId
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <DestinationCard
          key={account.id}
          account={account}
          isSelected={isDestinationSelected}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

// Individual destination card with destinations loading
function DestinationCard({
  account,
  isSelected,
  onToggle,
}: {
  account: ConnectedAccount;
  isSelected: (accountId: string, destinationId: string) => boolean;
  onToggle: (account: ConnectedAccount, destination: Destination) => void;
}) {
  const { data: destinations, isLoading } = useDestinations(account.id);

  // If no destinations loaded yet, use default destination
  const destinationList = destinations || [
    {
      destinationId: account.platformUserId || 'timeline',
      name: account.displayName || account.platformUsername,
      type: 'profile',
    },
  ];

  return (
    <div className="p-3 rounded-lg bg-muted space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 flex items-center justify-center bg-background rounded-full">
          {platformIcons[account.platform]}
        </span>
        <div className="flex-1">
          <p className="font-medium text-sm">
            {account.displayName || account.platformUsername}
          </p>
          <p className="text-xs text-muted-foreground">@{account.platformUsername}</p>
        </div>
        <Badge variant="secondary" className={statusColors[account.status]}>
          متصل
        </Badge>
      </div>

      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        <div className="space-y-1 mr-11">
          {destinationList.map((dest) => (
            <div
              key={dest.destinationId}
              className="flex items-center gap-2 p-2 rounded hover:bg-background cursor-pointer"
              onClick={() => onToggle(account, dest)}
            >
              <Checkbox
                checked={isSelected(account.id, dest.destinationId)}
                onCheckedChange={() => onToggle(account, dest)}
              />
              <span className="text-sm">{dest.name}</span>
              {dest.type && (
                <Badge variant="outline" className="text-xs">
                  {dest.type === 'profile' ? 'ملف شخصي' : dest.type}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { platformIcons, statusColors };
