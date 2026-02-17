import { ShieldCheck, Lightbulb, AlertCircle } from 'lucide-react';
import { BrandScoreBadge } from './BrandScoreBadge';
import type { BrandConsistencyResponse } from '../types';

const aspectLabels: Record<string, string> = {
  tone: 'النبرة',
  vocabulary: 'المفردات',
  audienceAlignment: 'توافق الجمهور',
};

function getBarColor(score: number) {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

interface BrandScoreDisplayProps {
  result: BrandConsistencyResponse;
}

export function BrandScoreDisplay({ result }: BrandScoreDisplayProps) {
  return (
    <div className="space-y-5">
      {/* Overall Score */}
      <div className="flex items-center justify-between bg-muted rounded-lg p-4 border">
        <div>
          <p className="text-sm font-medium">النتيجة الإجمالية</p>
          <p className="text-xs text-muted-foreground mt-1">مدى توافق المحتوى مع الهوية</p>
        </div>
        <BrandScoreBadge score={result.overallScore} size="lg" showLabel />
      </div>

      {/* Aspect Scores */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          التحليل التفصيلي
        </h3>
        <div className="space-y-3">
          {Object.entries(result.aspectScores).map(([key, score]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{aspectLabels[key] || key}</span>
                <span className="text-sm font-medium">{score}/100</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {result.feedback && result.feedback.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            ملاحظات
          </h3>
          <ul className="space-y-2">
            {result.feedback.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            توصيات للتحسين
          </h3>
          <ul className="space-y-2">
            {result.suggestions.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
