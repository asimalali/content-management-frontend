import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage, t, type Translations } from '@/hooks/use-language';

const translations: Record<string, Translations> = {
  title: { ar: 'ابدأ مجاناً', en: 'Start for Free' },
  subtitle: {
    ar: 'جرب المنصة مجاناً واكتشف قوة الذكاء الاصطناعي في إنشاء المحتوى',
    en: 'Try the platform for free and discover the power of AI in content creation',
  },
  freeTier: { ar: 'الباقة المجانية', en: 'Free Tier' },
  free: { ar: 'مجاني', en: 'Free' },
  forStarting: { ar: 'للبدء واستكشاف المنصة', en: 'To start and explore the platform' },
  getStarted: { ar: 'ابدأ مجاناً', en: 'Get Started Free' },
  viewAllPlans: { ar: 'اطلع على جميع الباقات', en: 'View all plans' },
  forAdvanced: {
    ar: 'للميزات المتقدمة والمزيد من الوحدات',
    en: 'for advanced features and more credits',
  },
};

const features: Translations[] = [
  { ar: '50 وحدة محتوى شهرياً', en: '50 content credits per month' },
  { ar: 'الوصول لجميع القوالب', en: 'Access to all templates' },
  { ar: 'مشروع واحد', en: 'One project' },
  { ar: 'النشر على X و Instagram', en: 'Publish to X & Instagram' },
  { ar: 'دعم فني عبر البريد', en: 'Email support' },
];

export function PricingSection() {
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t(translations.title, language)}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(translations.subtitle, language)}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="relative border-primary">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              {t(translations.freeTier, language)}
            </Badge>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{t(translations.free, language)}</span>
              </div>
              <CardDescription>{t(translations.forStarting, language)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{t(feature, language)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth" className="w-full">
                <Button className="w-full" size="lg">
                  {t(translations.getStarted, language)}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          <Link href="/auth" className="text-primary hover:underline">
            {t(translations.viewAllPlans, language)}
          </Link>{' '}
          {t(translations.forAdvanced, language)}
        </p>
      </div>
    </section>
  );
}
