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

// --- Content Status ---
export const CONTENT_STATUS_CONFIG: Record<string, { variant: string; label: string }> = {
  Draft: { variant: 'secondary', label: 'مسودة' },
  Final: { variant: 'default', label: 'نهائي' },
  Published: { variant: 'outline', label: 'منشور' },
  Archived: { variant: 'destructive', label: 'مؤرشف' },
};
