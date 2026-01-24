import { Badge } from '@/components/ui/badge';
import { useLanguage, t, type Translations } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

interface Platform {
  name: string;
  icon: string;
  status: 'available' | 'coming_soon';
}

const platforms: Platform[] = [
  { name: 'X', icon: '𝕏', status: 'available' },
  { name: 'Instagram', icon: '📸', status: 'available' },
  { name: 'Facebook', icon: 'f', status: 'coming_soon' },
  { name: 'TikTok', icon: '♪', status: 'coming_soon' },
];

const translations: Record<string, Translations> = {
  title: { ar: 'المنصات المدعومة', en: 'Supported Platforms' },
  subtitle: {
    ar: 'انشر محتواك مباشرة على منصات التواصل الاجتماعي المفضلة لديك',
    en: 'Publish your content directly to your favorite social media platforms',
  },
  comingSoon: { ar: 'قريباً', en: 'Coming Soon' },
};

export function PlatformsSection() {
  const { language } = useLanguage();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{t(translations.title, language)}</h2>
        <p className="text-muted-foreground mb-12">
          {t(translations.subtitle, language)}
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  'h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold transition-transform hover:scale-105',
                  platform.status === 'available'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {platform.icon}
              </div>
              <span className="font-medium">{platform.name}</span>
              {platform.status === 'coming_soon' && (
                <Badge variant="secondary">{t(translations.comingSoon, language)}</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
