import { useLanguage, t, type Translations } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import {
  FileText,
  Palette,
  Package,
  Monitor,
  LayoutGrid,
  Mail,
  Smartphone,
  Image,
  BookOpen,
  Feather,
  Layers,
  Type,
} from 'lucide-react';

interface BrandTile {
  id: number;
  title: Translations;
  description: Translations;
  icon: React.ReactNode;
  bgClass: string;
  accentClass: string;
}

const translations = {
  sectionTitle: {
    ar: 'هوية سَـرْد البصرية',
    en: 'Sard Brand Identity'
  },
  sectionSubtitle: {
    ar: 'نظام هوية بصرية متكامل ثنائي اللغة مستوحى من السرد والإبداع الرقمي',
    en: 'A unified bilingual brand system inspired by storytelling and digital creation',
  },
  brandName: {
    ar: 'سَـرْد',
    en: 'Sard',
  },
};

const brandTiles: BrandTile[] = [
  {
    id: 1,
    title: { ar: 'الشعار الرئيسي', en: 'Primary Logo' },
    description: { ar: 'شعار سَـرْد | Sard على بطاقة ورقية فاخرة', en: 'Logo lockup on premium paper card' },
    icon: <Feather className="h-8 w-8" />,
    bgClass: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    accentClass: 'text-primary',
  },
  {
    id: 2,
    title: { ar: 'الشعارات الثانوية', en: 'Secondary Marks' },
    description: { ar: 'نظام الأيقونات والمونوغرام', en: 'Icon system and monogram variations' },
    icon: <Layers className="h-8 w-8" />,
    bgClass: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
    accentClass: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 3,
    title: { ar: 'الألوان والخطوط', en: 'Colors & Typography' },
    description: { ar: 'لوحة الألوان وعينات الخطوط', en: 'Color palette and typography specimen' },
    icon: <Palette className="h-8 w-8" />,
    bgClass: 'from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900',
    accentClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 4,
    title: { ar: 'حزمة المحتوى', en: 'Content Kit' },
    description: { ar: 'تغليف حزمة أصول العلامة التجارية', en: 'Brand assets package mockup' },
    icon: <Package className="h-8 w-8" />,
    bgClass: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
    accentClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 5,
    title: { ar: 'واجهة المنصة', en: 'Platform Interface' },
    description: { ar: 'لوحة التحكم واستوديو المحتوى', en: 'Dashboard and content studio' },
    icon: <Monitor className="h-8 w-8" />,
    bgClass: 'from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30',
    accentClass: 'text-primary',
  },
  {
    id: 6,
    title: { ar: 'وحدات المحتوى', en: 'Content Modules' },
    description: { ar: 'منشور، حملة، سلسلة', en: 'Post, campaign, series formats' },
    icon: <LayoutGrid className="h-8 w-8" />,
    bgClass: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
    accentClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 7,
    title: { ar: 'المطبوعات', en: 'Stationery' },
    description: { ar: 'بطاقة عمل، ورق رسمي، مظروف', en: 'Business card, letterhead, envelope' },
    icon: <Mail className="h-8 w-8" />,
    bgClass: 'from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900',
    accentClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 8,
    title: { ar: 'وسائل التواصل', en: 'Social Media' },
    description: { ar: 'منشورات وواجهة الجوال', en: 'Posts and mobile UI preview' },
    icon: <Smartphone className="h-8 w-8" />,
    bgClass: 'from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900',
    accentClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 9,
    title: { ar: 'مشهد الحياة', en: 'Lifestyle Scene' },
    description: { ar: 'حزمة المحتوى مع عناصر السرد والنشر', en: 'Content Kit with narrative props' },
    icon: <BookOpen className="h-8 w-8" />,
    bgClass: 'from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900',
    accentClass: 'text-violet-600 dark:text-violet-400',
  },
];

function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1", className)}>
      <span className="text-2xl md:text-3xl font-bold tracking-tight">سَـرْد</span>
      <span className="text-xs md:text-sm font-medium tracking-widest uppercase opacity-60">Sard</span>
    </div>
  );
}

function ColorSwatches() {
  return (
    <div className="flex gap-1.5">
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary shadow-sm" />
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-500 shadow-sm" />
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-500 shadow-sm" />
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-800 dark:bg-slate-200 shadow-sm" />
    </div>
  );
}

function TypographyPreview() {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-lg md:text-xl font-bold">Aa أب</span>
      <span className="text-[10px] md:text-xs opacity-60">Cairo · Inter</span>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="w-full max-w-[120px] md:max-w-[140px] mx-auto">
      <div className="bg-background/80 rounded-lg shadow-sm border border-border/50 p-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="h-1.5 bg-muted rounded w-3/4" />
        <div className="grid grid-cols-3 gap-1">
          <div className="h-6 md:h-8 bg-primary/20 rounded" />
          <div className="h-6 md:h-8 bg-primary/30 rounded" />
          <div className="h-6 md:h-8 bg-primary/20 rounded" />
        </div>
        <div className="h-1 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

function ContentModules() {
  return (
    <div className="flex items-end gap-1.5 justify-center">
      <div className="w-8 md:w-10 h-10 md:h-12 bg-primary/30 rounded shadow-sm flex items-center justify-center">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div className="w-10 md:w-12 h-12 md:h-14 bg-primary/40 rounded shadow-sm flex items-center justify-center">
        <LayoutGrid className="h-5 w-5 text-primary" />
      </div>
      <div className="w-8 md:w-10 h-10 md:h-12 bg-primary/30 rounded shadow-sm flex items-center justify-center">
        <Layers className="h-4 w-4 text-primary" />
      </div>
    </div>
  );
}

function StationeryPreview() {
  return (
    <div className="relative w-full max-w-[100px] md:max-w-[120px] mx-auto h-16 md:h-20">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 md:w-20 h-10 md:h-12 bg-background border border-border/50 rounded shadow-sm transform -rotate-3" />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 md:w-12 h-14 md:h-16 bg-background border border-border/50 rounded shadow-sm transform rotate-2" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 md:w-10 h-5 md:h-6 bg-background border border-border/50 rounded shadow-sm flex items-center justify-center">
        <span className="text-[6px] md:text-[8px] font-bold text-primary">سَـرْد</span>
      </div>
    </div>
  );
}

function MobilePreview() {
  return (
    <div className="w-12 md:w-14 mx-auto">
      <div className="bg-background border-2 border-border rounded-xl p-1 shadow-sm">
        <div className="h-16 md:h-20 bg-gradient-to-b from-primary/20 to-primary/5 rounded-lg flex flex-col items-center justify-center gap-1">
          <div className="w-4 h-4 rounded-full bg-primary/30" />
          <div className="w-6 h-0.5 bg-muted rounded" />
          <div className="w-4 h-0.5 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

function LifestyleProps() {
  return (
    <div className="flex items-center justify-center gap-2">
      <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-violet-500/60" />
      <div className="w-8 md:w-10 h-10 md:h-12 bg-violet-200/50 dark:bg-violet-800/30 rounded shadow-sm flex items-center justify-center">
        <Feather className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>
      <Image className="h-5 w-5 md:h-6 md:w-6 text-violet-500/60" />
    </div>
  );
}

function IconSystemPreview() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-purple-200/50 dark:bg-purple-800/30 flex items-center justify-center">
        <Feather className="h-3 w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-purple-300/50 dark:bg-purple-700/30 flex items-center justify-center">
        <span className="text-[10px] md:text-xs font-bold text-purple-600 dark:text-purple-400">س</span>
      </div>
      <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-purple-200/50 dark:bg-purple-800/30 flex items-center justify-center">
        <span className="text-[10px] md:text-xs font-bold text-purple-600 dark:text-purple-400">S</span>
      </div>
    </div>
  );
}

function PackagePreview() {
  return (
    <div className="relative w-14 md:w-16 h-14 md:h-16 mx-auto">
      <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/30 rounded-lg transform rotate-3 shadow-sm" />
      <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/50 rounded-lg shadow-sm flex items-center justify-center border border-amber-300/30 dark:border-amber-700/30">
        <div className="text-center">
          <span className="text-xs md:text-sm font-bold text-amber-700 dark:text-amber-300">سَـرْد</span>
          <div className="text-[8px] md:text-[10px] text-amber-600/60 dark:text-amber-400/60">Kit</div>
        </div>
      </div>
    </div>
  );
}

function TileContent({ tile }: { tile: BrandTile }) {
  switch (tile.id) {
    case 1:
      return <LogoMark />;
    case 2:
      return <IconSystemPreview />;
    case 3:
      return (
        <div className="flex flex-col items-center gap-2">
          <ColorSwatches />
          <TypographyPreview />
        </div>
      );
    case 4:
      return <PackagePreview />;
    case 5:
      return <DashboardPreview />;
    case 6:
      return <ContentModules />;
    case 7:
      return <StationeryPreview />;
    case 8:
      return <MobilePreview />;
    case 9:
      return <LifestyleProps />;
    default:
      return tile.icon;
  }
}

export function BrandIdentityGrid() {
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl md:text-4xl font-bold">{t(translations.brandName, language)}</span>
            <span className="text-2xl md:text-3xl text-muted-foreground">|</span>
            <span className="text-2xl md:text-3xl font-semibold text-muted-foreground">Sard</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t(translations.sectionTitle, language)}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(translations.sectionSubtitle, language)}
          </p>
        </div>

        {/* 3×3 Brand Identity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {brandTiles.map((tile) => (
            <div
              key={tile.id}
              className={cn(
                "group relative aspect-square rounded-2xl overflow-hidden",
                "bg-gradient-to-br shadow-sm hover:shadow-lg transition-all duration-300",
                "border border-border/50",
                tile.bgClass
              )}
            >
              {/* Tile Number Badge */}
              <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                  "bg-background/80 backdrop-blur-sm shadow-sm",
                  tile.accentClass
                )}>
                  {tile.id}
                </span>
              </div>

              {/* Tile Content - Visual Representation */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className={cn("transition-transform duration-300 group-hover:scale-105", tile.accentClass)}>
                  <TileContent tile={tile} />
                </div>
              </div>

              {/* Tile Info Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/95 via-background/80 to-transparent">
                <h3 className="font-semibold text-sm md:text-base mb-0.5">
                  {t(tile.title, language)}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {t(tile.description, language)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Signature */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'هوية بصرية متكاملة · ثنائية اللغة · جودة عالية'
                : 'Complete Brand System · Bilingual · Premium Quality'}
            </span>
            <Type className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
}
