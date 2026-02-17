import { useState } from 'react';
import { Lightbulb, Loader2, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/features/projects';
import { useProjectIdeas, useRefreshIdeas, useGenerateFromIdea } from '../hooks/use-content-ideas';
import type { ContentIdeaResponse } from '../types';
import { toast } from 'sonner';

const platformColors: Record<string, string> = {
  X: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  Instagram: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  TikTok: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Facebook: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

function IdeaCard({ idea, onGenerate, isGenerating }: {
  idea: ContentIdeaResponse;
  onGenerate: (ideaId: string) => void;
  isGenerating: boolean;
}) {
  return (
    <Card className="border hover:shadow-sm transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-tight">{idea.topic}</h4>
          <Badge variant="secondary" className={platformColors[idea.suggestedPlatform] || platformColors.X}>
            {idea.suggestedPlatform}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{idea.description}</p>
        <div className="flex items-center justify-between pt-1">
          <Badge variant="outline" className="text-xs">
            {idea.contentType}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onGenerate(idea.id)}
            disabled={isGenerating || idea.isUsed}
            className="text-xs h-7"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin ml-1" />
            ) : (
              <Sparkles className="h-3 w-3 ml-1" />
            )}
            {idea.isUsed ? 'تم الاستخدام' : 'إنشاء محتوى'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function IdeasWidget() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [generatingIdeaId, setGeneratingIdeaId] = useState<string | null>(null);

  const { data: projects } = useProjects();
  const { data: ideas, isLoading: isLoadingIdeas } = useProjectIdeas(selectedProjectId || undefined);
  const refreshIdeas = useRefreshIdeas();
  const generateFromIdea = useGenerateFromIdea();

  const handleRefresh = () => {
    if (!selectedProjectId) return;
    refreshIdeas.mutate({ projectId: selectedProjectId });
  };

  const handleGenerate = (ideaId: string) => {
    setGeneratingIdeaId(ideaId);
    generateFromIdea.mutate(ideaId, {
      onSuccess: () => {
        toast.success('تم إنشاء المحتوى بنجاح! يمكنك العثور عليه في مكتبة المحتوى.');
        setGeneratingIdeaId(null);
      },
      onError: () => {
        toast.error('فشل إنشاء المحتوى. يرجى المحاولة مرة أخرى.');
        setGeneratingIdeaId(null);
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">أفكار محتوى بالذكاء الاصطناعي</CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <Badge variant="outline" className="text-xs">
              مجاني &middot; 1 وحدة لإنشاء محتوى
            </Badge>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
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
                onClick={handleRefresh}
                disabled={!selectedProjectId || refreshIdeas.isPending}
                variant="outline"
              >
                {refreshIdeas.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                تحديث الأفكار
              </Button>
            </div>

            {refreshIdeas.isError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {(refreshIdeas.error as Error)?.message || 'فشل تحديث الأفكار. يرجى المحاولة مرة أخرى.'}
              </div>
            )}

            {isLoadingIdeas && selectedProjectId && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {ideas && ideas.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onGenerate={handleGenerate}
                    isGenerating={generatingIdeaId === idea.id}
                  />
                ))}
              </div>
            )}

            {ideas && ideas.length === 0 && selectedProjectId && !isLoadingIdeas && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                لا توجد أفكار لهذا المشروع. اضغط "تحديث الأفكار" لتوليد أفكار جديدة.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
