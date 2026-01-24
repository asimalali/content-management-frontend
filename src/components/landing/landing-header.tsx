import { useState } from 'react';
import { Link } from 'wouter';
import { Sparkles, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage, t } from '@/hooks/use-language';

const translations = {
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  getStarted: { ar: 'ابدأ مجاناً', en: 'Get Started Free' },
  platformName: { ar: 'منصة المحتوى', en: 'Content Platform' },
};

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">{t(translations.platformName, language)}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          >
            <Globe className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Link href="/auth">
            <Button variant="ghost">{t(translations.login, language)}</Button>
          </Link>
          <Link href="/auth">
            <Button>{t(translations.getStarted, language)}</Button>
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-2 bg-background">
          <Link href="/auth" className="block">
            <Button variant="ghost" className="w-full">{t(translations.login, language)}</Button>
          </Link>
          <Link href="/auth" className="block">
            <Button className="w-full">{t(translations.getStarted, language)}</Button>
          </Link>
          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
            >
              <Globe className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
