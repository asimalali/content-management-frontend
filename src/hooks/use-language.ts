import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === 'ar' ? 'en' : 'ar',
        })),
    }),
    {
      name: 'content-platform-language',
    }
  )
);

// Translation type
export interface Translations {
  ar: string;
  en: string;
}

// Helper to get translated text
export function t(translations: Translations, language: Language): string {
  return translations[language];
}
