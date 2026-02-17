import { useState } from 'react';
import { Lightbulb, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useProjects } from '@/features/projects';
// TODO: Implement Performance Insights backend first
// import { useGenerateInsights } from '../hooks/use-optimization';

interface PerformanceInsight {
  category: string;
  title: string;
  description: string;
  actionableAdvice: string;
}

interface PerformanceInsightsResult {
  totalPostsAnalyzed: number;
  creditsUsed: number;
  insights: PerformanceInsight[];
  overallSummary: string;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  content_type: {
    label: 'نوع المحتوى',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  timing: {
    label: 'التوقيت',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  engagement: {
    label: 'التفاعل',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  hashtags: {
    label: 'الهاشتاقات',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  platform: {
    label: 'المنصة',
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  },
};

export function InsightsPanel() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState<PerformanceInsightsResult | null>(null);

  const { data: projects } = useProjects();
  // TODO: Implement useGenerateInsights hook and backend
  const generateInsights = {
    mutate: (_params: { projectId: string }, _options?: { onSuccess?: (data: PerformanceInsightsResult) => void }) => {},
    isPending: false,
    isError: false,
    error: null as Error | null,
  };

  const handleGenerate = () => {
    if (!selectedProjectId) return;

    generateInsights.mutate(
      { projectId: selectedProjectId },
      {
        onSuccess: (data: PerformanceInsightsResult) => {
          setInsights(data);
        },
      }
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">تحليلات الأداء بالذكاء الاصطناعي</CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <Badge variant="outline" className="text-xs">
              2 وحدة لكل تحليل
            </Badge>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Project selector + Generate button */}
            <div className="flex items-center gap-3">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  {(projects || []).map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleGenerate}
                disabled={!selectedProjectId || generateInsights.isPending}
              >
                {generateInsights.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Sparkles className="h-4 w-4 ml-2" />
                )}
                إنشاء تحليلات
              </Button>
            </div>

            {/* Error state */}
            {generateInsights.isError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {(generateInsights.error as Error)?.message || 'فشل إنشاء التحليلات. يرجى المحاولة مرة أخرى.'}
              </div>
            )}

            {/* Results */}
            {insights && (
              <div className="space-y-4">
                {/* Stats bar */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>المنشورات المحللة: {insights.totalPostsAnalyzed}</span>
                  <span>الرصيد المستخدم: {insights.creditsUsed} وحدة</span>
                </div>

                {/* Insights grid */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {insights.insights.map((insight: PerformanceInsight, index: number) => {
                    const config = categoryConfig[insight.category] || categoryConfig.engagement;
                    return (
                      <Card key={index} className="border">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="secondary" className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground">{insight.description}</p>
                          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium">{insight.actionableAdvice}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Overall summary */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">الملخص العام</h4>
                  <p className="text-sm text-muted-foreground">{insights.overallSummary}</p>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
