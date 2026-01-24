import { Link } from 'wouter';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, t, type Translations } from '@/hooks/use-language';

const translations: Record<string, Translations> = {
  headline: {
    ar: 'جاهز لتحويل طريقة إنشاء محتواك؟',
    en: 'Ready to Transform Your Content Creation?',
  },
  subheadline: {
    ar: 'انضم إلى آلاف المستخدمين الذين يوفرون ساعات من العمل كل أسبوع',
    en: 'Join thousands of users who save hours of work every week',
  },
  cta: { ar: 'ابدأ مجاناً الآن', en: 'Get Started Free Now' },
};

export function CtaSection() {
  const { language } = useLanguage();
  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-primary p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t(translations.headline, language)}
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            {t(translations.subheadline, language)}
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="gap-2">
              {t(translations.cta, language)}
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
