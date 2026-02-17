/**
 * Shared Utility Functions
 *
 * Equivalent to backend's Application/Common/Helpers/.
 * Pure functions with no side effects.
 */

import { DATE_LOCALE, COPY_FEEDBACK_DURATION } from '@/config/constants';

// --- Date Formatting ---

/** Format an ISO date string using the app's locale */
export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(dateString).toLocaleDateString(DATE_LOCALE, options);
}

/** Format date with time (hour + minute) */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a Date object (not a string) */
export function formatDateObject(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return date.toLocaleDateString(DATE_LOCALE, options);
}

// --- Text ---

/** Truncate text to maxLength, appending ellipsis if truncated */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// --- Clipboard ---

/**
 * Copy text to clipboard and reset the copied state after a delay.
 * Returns a promise that resolves when the text is copied.
 *
 * @example
 * const [copied, setCopied] = useState(false);
 * onClick={() => copyToClipboard(text, setCopied)}
 */
export async function copyToClipboard(
  text: string,
  setCopied: (copied: boolean) => void,
): Promise<void> {
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
}
