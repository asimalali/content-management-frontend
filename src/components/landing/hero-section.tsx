import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, t } from '@/hooks/use-language';

const translations = {
  badge: { ar: 'مدعوم بالذكاء الاصطناعي', en: 'Powered by AI' },
  headline1: { ar: 'أنشئ محتوى احترافي', en: 'Create Professional Content' },
  headline2: { ar: 'بقوة الذكاء الاصطناعي', en: 'With AI Power' },
  subheadline: {
    ar: 'منصة متكاملة لإنشاء ونشر المحتوى على منصات التواصل الاجتماعي. وفر وقتك واحصل على محتوى جذاب في ثوانٍ.',
    en: 'A complete platform to create and publish content on social media. Save time and get engaging content in seconds.',
  },
  getStarted: { ar: 'ابدأ مجاناً', en: 'Get Started Free' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  noCreditCard: {
    ar: 'لا حاجة لبطاقة ائتمان • ابدأ في أقل من دقيقة',
    en: 'No credit card required • Start in less than a minute',
  },
};

export function HeroSection() {
  const { language } = useLanguage();
  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 animate-gradient opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <div className="container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
          <Sparkles className="h-4 w-4" />
          <span>{t(translations.badge, language)}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          {t(translations.headline1, language)}
          <br />
          <span className="text-primary">{t(translations.headline2, language)}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t(translations.subheadline, language)}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth">
            <Button size="lg" className="gap-2">
              {t(translations.getStarted, language)}
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" variant="outline">
              {t(translations.login, language)}
            </Button>
          </Link>
        </div>

        {/* Trust indicator */}
        <p className="text-sm text-muted-foreground mt-6">
          {t(translations.noCreditCard, language)}
        </p>
      </div>
    </section>
  );
}
