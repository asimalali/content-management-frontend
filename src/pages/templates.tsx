import { useState } from 'react';
import { Link } from 'wouter';
import { Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTemplates, type Template } from '@/features/templates';

const categoryLabels: Record<string, string> = {
  SocialPost: 'منشور اجتماعي',
  MarketingCopy: 'نص تسويقي',
  BlogArticle: 'مقال',
  ProductDescription: 'وصف منتج',
};

const categoryColors: Record<string, string> = {
  SocialPost: 'bg-blue-500',
  MarketingCopy: 'bg-green-500',
  BlogArticle: 'bg-purple-500',
  ProductDescription: 'bg-orange-500',
};

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${categoryColors[template.category]} flex items-center justify-center text-white`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {categoryLabels[template.category]}
              </Badge>
            </div>
          </div>
          <Badge variant="outline">{template.creditCost} وحدة</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
        <Button asChild className="w-full">
          <Link href={`/create?templateId=${template.id}`}>
            <Sparkles className="ml-2 h-4 w-4" />
            استخدام القالب
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function TemplateCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <FileText className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">حدث خطأ</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        تعذر تحميل القوالب. يرجى المحاولة مرة أخرى.
      </p>
      <Button onClick={onRetry} variant="outline">
        إعادة المحاولة
      </Button>
    </div>
  );
}

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Fetch templates from API
  const { data: templates, isLoading, isError, refetch } = useTemplates();

  const filteredTemplates = activeTab === 'all'
    ? (templates || [])
    : (templates || []).filter(t => t.category === activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">القوالب</h1>
        <p className="text-muted-foreground">
          اختر قالباً لإنشاء محتوى احترافي بالذكاء الاصطناعي
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="SocialPost">منشورات اجتماعية</TabsTrigger>
          <TabsTrigger value="MarketingCopy">نصوص تسويقية</TabsTrigger>
          <TabsTrigger value="BlogArticle">مقالات</TabsTrigger>
          <TabsTrigger value="ProductDescription">وصف منتجات</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد قوالب في هذه الفئة
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
