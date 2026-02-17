import { useState } from 'react';
import { Users, Loader2, Sparkles, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
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
import { useProjectPersonas, useGeneratePersonas } from '../hooks/use-personas';
import type { PersonaResponse } from '../types';

function PersonaCard({ persona }: { persona: PersonaResponse }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{persona.avatarEmoji}</span>
          <div>
            <h4 className="font-semibold text-sm">{persona.name}</h4>
            <p className="text-xs text-muted-foreground">{persona.age} سنة &middot; {persona.occupation}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{persona.summary}</p>

        <div className="flex flex-wrap gap-1">
          {persona.preferredPlatforms.map((platform) => (
            <Badge key={platform} variant="secondary" className="text-xs">
              {platform}
            </Badge>
          ))}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showDetails && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <p className="text-xs font-semibold flex items-center gap-1 mb-1">
                <Heart className="h-3 w-3 text-red-500" />
                نقاط الألم
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {persona.painPoints.map((point, i) => (
                  <li key={i}>&bull; {point}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold mb-1">تفضيلات المحتوى</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {persona.contentPreferences.map((pref, i) => (
                  <li key={i}>&bull; {pref}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded">
                <p className="text-xs font-semibold flex items-center gap-1 mb-1">
                  <ThumbsUp className="h-3 w-3 text-green-600" />
                  افعل
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {persona.messagingDos.map((d, i) => (
                    <li key={i}>&bull; {d}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded">
                <p className="text-xs font-semibold flex items-center gap-1 mb-1">
                  <ThumbsDown className="h-3 w-3 text-red-600" />
                  لا تفعل
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {persona.messagingDonts.map((d, i) => (
                    <li key={i}>&bull; {d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PersonaPanel() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: projects } = useProjects();
  const { data: personas, isLoading: isLoadingPersonas } = useProjectPersonas(selectedProjectId || undefined);
  const generatePersonas = useGeneratePersonas();

  const handleGenerate = () => {
    if (!selectedProjectId) return;
    generatePersonas.mutate({ projectId: selectedProjectId });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Users className="h-5 w-5 text-violet-500" />
                <CardTitle className="text-lg">شخصيات الجمهور بالذكاء الاصطناعي</CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <Badge variant="outline" className="text-xs">
              3 وحدات لكل توليد
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
                onClick={handleGenerate}
                disabled={!selectedProjectId || generatePersonas.isPending}
              >
                {generatePersonas.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Sparkles className="h-4 w-4 ml-2" />
                )}
                إنشاء شخصيات
              </Button>
            </div>

            {generatePersonas.isError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {(generatePersonas.error as Error)?.message || 'فشل إنشاء الشخصيات. يرجى المحاولة مرة أخرى.'}
              </div>
            )}

            {isLoadingPersonas && selectedProjectId && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {personas && personas.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {personas.map((persona) => (
                  <PersonaCard key={persona.id} persona={persona} />
                ))}
              </div>
            )}

            {personas && personas.length === 0 && selectedProjectId && !isLoadingPersonas && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                لا توجد شخصيات لهذا المشروع. اضغط "إنشاء شخصيات" لتوليدها.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
