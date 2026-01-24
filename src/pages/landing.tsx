import { useLanguage } from '@/hooks/use-language';
import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  PlatformsSection,
  PricingSection,
  CtaSection,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  const { language } = useLanguage();

  return (
    <div
      className="min-h-screen bg-background"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PlatformsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
