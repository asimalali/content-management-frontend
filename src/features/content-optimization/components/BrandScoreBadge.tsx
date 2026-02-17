import { ShieldCheck, Shield, ShieldAlert, ShieldX } from 'lucide-react';

interface BrandScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
  lg: 'w-20 h-20 text-lg',
} as const;

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
} as const;

function getScoreConfig(score: number) {
  if (score >= 90) return { color: 'text-green-600 border-green-400 bg-green-50', Icon: ShieldCheck, label: 'ممتاز' };
  if (score >= 70) return { color: 'text-blue-600 border-blue-400 bg-blue-50', Icon: Shield, label: 'جيد' };
  if (score >= 50) return { color: 'text-yellow-600 border-yellow-400 bg-yellow-50', Icon: ShieldAlert, label: 'متوسط' };
  return { color: 'text-red-600 border-red-400 bg-red-50', Icon: ShieldX, label: 'يحتاج تحسين' };
}

export function BrandScoreBadge({ score, size = 'md', showLabel = false }: BrandScoreBadgeProps) {
  const { color, Icon, label } = getScoreConfig(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClasses[size]} ${color} rounded-full border-2 flex flex-col items-center justify-center font-bold`}>
        <Icon className={iconSizes[size]} />
        <span>{score}</span>
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${color.split(' ')[0]}`}>{label}</span>
      )}
    </div>
  );
}
