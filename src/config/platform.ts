/**
 * Platform & Status Display Constants
 *
 * Single source of truth for platform icons, names,
 * and status color/label mappings used across the app.
 */

// --- Platform Display Config ---
export const PLATFORM_CONFIG = {
  X: { nameAr: 'X (تويتر)', nameEn: 'X (Twitter)', icon: '𝕏' },
  Instagram: { nameAr: 'انستقرام', nameEn: 'Instagram', icon: '📷' },
  Facebook: { nameAr: 'فيسبوك', nameEn: 'Facebook', icon: 'f' },
  TikTok: { nameAr: 'تيك توك', nameEn: 'TikTok', icon: '♪' },
} as const;

export type PlatformKey = keyof typeof PLATFORM_CONFIG;

// --- Connection Status ---
export const CONNECTION_STATUS_CONFIG: Record<string, { color: string; colorDark: string; label: string }> = {
  Connected: {
    color: 'bg-green-100 text-green-800',
    colorDark: 'dark:bg-green-900 dark:text-green-200',
    label: 'متصل',
  },
  Expired: {
    color: 'bg-yellow-100 text-yellow-800',
    colorDark: 'dark:bg-yellow-900 dark:text-yellow-200',
    label: 'منتهي الصلاحية',
  },
  Revoked: {
    color: 'bg-red-100 text-red-800',
    colorDark: 'dark:bg-red-900 dark:text-red-200',
    label: 'ملغى',
  },
  Error: {
    color: 'bg-red-100 text-red-800',
    colorDark: 'dark:bg-red-900 dark:text-red-200',
    label: 'خطأ',
  },
};

/** Get connection status full className (light + dark) */
export function getConnectionStatusClass(status: string): string {
  const cfg = CONNECTION_STATUS_CONFIG[status];
  if (!cfg) return '';
  return `${cfg.color} ${cfg.colorDark}`;
}

/** Get connection status label */
export function getConnectionStatusLabel(status: string): string {
  return CONNECTION_STATUS_CONFIG[status]?.label ?? status;
}

// --- Platform Labels (for optimization/repurpose dialogs) ---
export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  X: 'X (Twitter)',
  Facebook: 'Facebook',
  Instagram: 'Instagram',
  TikTok: 'TikTok',
};

// --- Platform Labels in Arabic (for calendar/content) ---
export const PLATFORM_LABELS_AR: Record<string, string> = {
  X: 'X',
  Instagram: 'انستقرام',
  Facebook: 'فيسبوك',
  TikTok: 'تيك توك',
};

// --- Platform Badge Colors (dark pill style) ---
export const PLATFORM_BADGE_COLORS: Record<PlatformKey, string> = {
  X: 'bg-slate-900 text-white',
  Facebook: 'bg-blue-600 text-white',
  Instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white',
  TikTok: 'bg-black text-white',
};

// --- Platform Badge Colors (light style, for cards/widgets) ---
export const PLATFORM_BADGE_COLORS_LIGHT: Record<string, string> = {
  X: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  Instagram: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  TikTok: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Facebook: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

/** Get platform label (English) */
export function getPlatformLabel(platform: string): string {
  return PLATFORM_LABELS[platform as PlatformKey] ?? platform;
}

/** Get platform label (Arabic) */
export function getPlatformLabelAr(platform: string): string {
  return PLATFORM_LABELS_AR[platform] ?? platform;
}

// --- Calendar Entry Status ---
export const CALENDAR_STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  Idea: { label: 'فكرة', bg: 'bg-gray-100 text-gray-700' },
  ContentGenerated: { label: 'تم إنشاء المحتوى', bg: 'bg-green-100 text-green-700' },
  Published: { label: 'تم النشر', bg: 'bg-blue-100 text-blue-700' },
  Skipped: { label: 'تم التخطي', bg: 'bg-yellow-100 text-yellow-700' },
};

// --- Content Status ---
export const CONTENT_STATUS_CONFIG: Record<string, { variant: string; label: string }> = {
  Draft: { variant: 'secondary', label: 'مسودة' },
  Final: { variant: 'default', label: 'نهائي' },
  Published: { variant: 'outline', label: 'منشور' },
  Archived: { variant: 'destructive', label: 'مؤرشف' },
};
