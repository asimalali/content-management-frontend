import { Check, Lock, EyeOff } from 'lucide-react';

export type FeatureFlagStatus = 'enabled' | 'comingSoon' | 'hidden';

interface FeatureFlagStatusControlProps {
  currentState: FeatureFlagStatus;
  onChange: (newState: FeatureFlagStatus) => void;
  disabled?: boolean;
}

export function FeatureFlagStatusControl({
  currentState,
  onChange,
  disabled = false,
}: FeatureFlagStatusControlProps) {
  const options: Array<{
    value: FeatureFlagStatus;
    label: string;
    labelAr: string;
    icon: React.ElementType;
    colorClass: string;
    activeClass: string;
  }> = [
    {
      value: 'enabled',
      label: 'Enabled',
      labelAr: 'مفعّل',
      icon: Check,
      colorClass: 'text-green-600',
      activeClass: 'bg-green-100 border-green-600 text-green-700',
    },
    {
      value: 'comingSoon',
      label: 'Coming Soon',
      labelAr: 'قريباً',
      icon: Lock,
      colorClass: 'text-amber-600',
      activeClass: 'bg-amber-100 border-amber-600 text-amber-700',
    },
    {
      value: 'hidden',
      label: 'Hidden',
      labelAr: 'مخفي',
      icon: EyeOff,
      colorClass: 'text-gray-600',
      activeClass: 'bg-gray-100 border-gray-600 text-gray-700',
    },
  ];

  return (
    <div className="inline-flex rounded-md border border-input" role="group">
      {options.map((option, index) => {
        const Icon = option.icon;
        const isActive = currentState === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors
              ${isFirst ? 'rounded-l-md' : ''}
              ${isLast ? 'rounded-r-md' : ''}
              ${!isFirst ? 'border-l border-input' : ''}
              ${
                isActive
                  ? option.activeClass
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            `}
            aria-pressed={isActive}
            aria-label={`${option.label} - ${option.labelAr}`}
          >
            <Icon className={`h-4 w-4 ${isActive ? option.colorClass : ''}`} />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="text-xs opacity-70 hidden md:inline">
              {option.labelAr}
            </span>
          </button>
        );
      })}
    </div>
  );
}
