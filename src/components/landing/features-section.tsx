import {
  Sparkles,
  Share2,
  FileText,
  FolderKanban,
  Coins,
  Dna,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage, t, type Translations } from '@/hooks/use-language';

interface Feature {
  icon: typeof Sparkles;
  title: Translations;
  description: Translations;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: { ar: 'إنشاء محتوى بالذكاء الاصطناعي', en: 'AI-Powered Content Creation' },
    description: {
      ar: 'استخدم أحدث نماذج الذكاء الاصطناعي لإنشاء محتوى جذاب ومخصص لجمهورك.',
      en: 'Use the latest AI models to create engaging content tailored to your audience.',
    },
  },
  {
    icon: Share2,
    title: { ar: 'نشر على منصات متعددة', en: 'Multi-Platform Publishing' },
    description: {
      ar: 'انشر محتواك مباشرة على X وInstagram من مكان واحد.',
      en: 'Publish your content directly to X and Instagram from one place.',
    },
  },
  {
    icon: FileText,
    title: { ar: 'مكتبة قوالب جاهزة', en: 'Ready-Made Templates' },
    description: {
      ar: 'اختر من مجموعة متنوعة من القوالب المصممة لمختلف أنواع المحتوى.',
      en: 'Choose from a variety of templates designed for different content types.',
    },
  },
  {
    icon: FolderKanban,
    title: { ar: 'إدارة مشاريع متعددة', en: 'Multi-Project Management' },
    description: {
      ar: 'نظم محتواك في مشاريع منفصلة لكل علامة تجارية أو حملة.',
      en: 'Organize your content into separate projects for each brand or campaign.',
    },
  },
  {
    icon: Coins,
    title: { ar: 'نظام رصيد مرن', en: 'Flexible Credit System' },
    description: {
      ar: 'ادفع فقط مقابل ما تستخدمه مع باقة مجانية للبداية.',
      en: 'Pay only for what you use with a free tier to get started.',
    },
  },
  {
    icon: Dna,
    title: { ar: 'بصمة العلامة التجارية', en: 'Brand DNA' },
    description: {
      ar: 'حافظ على هوية علامتك التجارية في كل قطعة محتوى تنشئها.',
      en: 'Maintain your brand identity in every piece of content you create.',
    },
  },
];

const translations = {
  sectionTitle: { ar: 'كل ما تحتاجه لإدارة محتواك', en: 'Everything You Need to Manage Your Content' },
  sectionSubtitle: {
    ar: 'أدوات متكاملة تساعدك على إنشاء ونشر محتوى احترافي بسهولة',
    en: 'Integrated tools to help you create and publish professional content easily',
  },
};

export function FeaturesSection() {
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t(translations.sectionTitle, language)}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(translations.sectionSubtitle, language)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={t(feature.title, 'en')} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t(feature.title, language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t(feature.description, language)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
