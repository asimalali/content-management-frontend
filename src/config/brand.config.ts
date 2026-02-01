/**
 * Brand Configuration - Single Source of Truth
 *
 * This file contains all brand identity settings for the application.
 * To rebrand the application, simply update the values in `brandConfig`.
 *
 * All components use the `useBrand()` hook to access these values,
 * making rebranding a single-file change.
 */

export interface BrandName {
  ar: string;
  en: string;
  display: string; // Combined format: "سَـرْد | Sard"
}

export interface BrandTagline {
  ar: string;
  en: string;
}

export interface BrandLogo {
  type: 'svg' | 'url' | 'icon';
  value: string; // Path to SVG, URL, or Lucide icon name
}

export interface BrandColors {
  primary: string; // HSL format: "262 83% 58%"
  primaryDark: string; // For dark mode if different
}

export interface BrandMeta {
  title: string;
  description: {
    ar: string;
    en: string;
  };
}

export interface BrandConfig {
  // Identity
  name: BrandName;
  tagline: BrandTagline;

  // Visual
  logo: BrandLogo;
  favicon: string;

  // Colors (HSL format for CSS variables)
  colors: BrandColors;

  // Meta
  meta: BrandMeta;
}

/**
 * Main brand configuration object
 * Update these values to rebrand the entire application
 */
export const brandConfig: BrandConfig = {
  name: {
    ar: 'سَـرْد',
    en: 'Sard',
    display: 'سَـرْد | Sard',
  },

  tagline: {
    ar: 'اصنع قصتك',
    en: 'Create your story',
  },

  logo: {
    type: 'svg',
    value: '/sard-logo.svg',
  },

  favicon: '/sard-logo.svg',

  colors: {
    primary: '262 83% 58%', // Purple
    primaryDark: '262 83% 58%', // Same for dark mode
  },

  meta: {
    title: 'سَـرْد | Sard',
    description: {
      ar: 'منصة إنشاء المحتوى بالذكاء الاصطناعي',
      en: 'AI-powered content creation platform',
    },
  },
};
