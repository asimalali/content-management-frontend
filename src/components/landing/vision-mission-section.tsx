import { Eye, Target, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage, t, type Translations } from '@/hooks/use-language';

interface CoreValue {
  title: Translations;
  description: Translations;
}

const translations = {
  visionTitle: { ar: 'الرؤية', en: 'Vision' },
  visionDescription: {
    ar: 'تمكين العلامات التجارية من سرد محتواها بذكاء وأثر.',
    en: 'Empowering brands to tell their stories intelligently and impactfully.',
  },
  missionTitle: { ar: 'الرسالة', en: 'Mission' },
  missionDescription: {
    ar: 'تسهيل إنشاء محتوى احترافي ومتسق باستخدام أدوات ذكية تفهم هوية العلامة.',
    en: 'Making it easy to create professional, consistent content through intelligent tools that understand brand identity.',
  },
  valuesTitle: { ar: 'القيم الأساسية', en: 'Core Values' },
};

const coreValues: CoreValue[] = [
  {
    title: { ar: 'الوضوح', en: 'Clarity' },
    description: {
      ar: 'نؤمن أن المحتوى الجيد يبدأ برسالة واضحة وسياق مفهوم.',
      en: 'Great content starts with a clear message and context.',
    },
  },
  {
    title: { ar: 'الاتساق', en: 'Consistency' },
    description: {
      ar: 'نحافظ على هوية العلامة ونبرة صوتها في كل ما يُكتب.',
      en: 'We preserve brand identity and voice across every piece of content.',
    },
  },
  {
    title: { ar: 'الذكاء العملي', en: 'Practical Intelligence' },
    description: {
      ar: 'نستخدم الذكاء الاصطناعي كأداة تمكين، لا تعقيد.',
      en: 'AI is a tool for empowerment, not complexity.',
    },
  },
  {
    title: { ar: 'البساطة', en: 'Simplicity' },
    description: {
      ar: 'نصمم تجربة سهلة، تركز على النتيجة لا الخطوات.',
      en: 'We design experiences that focus on outcomes, not processes.',
    },
  },
  {
    title: { ar: 'التأثير', en: 'Impact' },
    description: {
      ar: 'نقيس نجاحنا بقدرة المحتوى على إحداث أثر حقيقي.',
      en: 'Success is measured by real influence, not just output.',
    },
  },
];

export function VisionMissionSection() {
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Vision & Mission Cards */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {/* Vision Card */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center pb-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t(translations.visionTitle, language)}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-lg">
                {t(translations.visionDescription, language)}
              </p>
            </CardContent>
          </Card>

          {/* Mission Card */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center pb-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t(translations.missionTitle, language)}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-lg">
                {t(translations.missionDescription, language)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values Section */}
        <div className="text-center mb-12">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">{t(translations.valuesTitle, language)}</h2>
        </div>

        {/* Core Values Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {coreValues.map((value, index) => (
            <Card key={t(value.title, 'en')} className="border-0 shadow-sm hover:shadow-md transition-shadow text-center">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">{index + 1}</span>
                </div>
                <CardTitle className="text-lg">{t(value.title, language)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t(value.description, language)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
