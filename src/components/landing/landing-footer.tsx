import { useLanguage } from '@/hooks/use-language';
import { useBrandName } from '@/hooks/use-brand';
import { BrandLogo } from '@/components/brand-logo';
import { BrandName } from '@/components/brand-name';

export function LandingFooter() {
  const { language } = useLanguage();
  const brandName = useBrandName();

  const copyrightText =
    language === 'ar'
      ? `© ${new Date().getFullYear()} ${brandName.ar}. جميع الحقوق محفوظة.`
      : `© ${new Date().getFullYear()} ${brandName.en}. All rights reserved.`;

  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <BrandName variant="short" className="font-bold" />
          </div>

          <p className="text-sm text-muted-foreground">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
