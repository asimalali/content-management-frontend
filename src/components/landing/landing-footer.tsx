import { Sparkles } from 'lucide-react';
import { useLanguage, t, type Translations } from '@/hooks/use-language';

const translations: Record<string, Translations> = {
  platformName: { ar: 'منصة المحتوى', en: 'Content Platform' },
  copyright: {
    ar: `© ${new Date().getFullYear()} منصة المحتوى. جميع الحقوق محفوظة.`,
    en: `© ${new Date().getFullYear()} Content Platform. All rights reserved.`,
  },
};

export function LandingFooter() {
  const { language } = useLanguage();

  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold">{t(translations.platformName, language)}</span>
          </div>

          <p className="text-sm text-muted-foreground">
            {t(translations.copyright, language)}
          </p>
        </div>
      </div>
    </footer>
  );
}
