/**
 * Timezone utilities for Vietnam (UTC+7)
 */

const VIETNAM_TZ_OFFSET = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds

/**
 * Convert UTC date to Vietnam time (UTC+7)
 * @param isoString ISO date string (default is UTC)
 * @returns Date adjusted to Vietnam timezone
 */
export function toVietnamTime(isoString?: string): Date | null {
  if (!isoString) return null;
  const utcDate = new Date(isoString);
  if (Number.isNaN(utcDate.getTime())) return null;

  // Get UTC time and add Vietnam offset
  const vietnamTime = new Date(utcDate.getTime() + VIETNAM_TZ_OFFSET);
  return vietnamTime;
}

/**
 * Format date/time to Vietnam timezone
 * @param iso ISO date string
 * @param locale Locale string (default: 'vi-VN')
 * @param opts Intl.DateTimeFormatOptions
 * @returns Formatted date string in Vietnam timezone
 */
export function formatVietnamDateTime(
  iso?: string,
  locale: string = 'vi-VN',
  opts?: Intl.DateTimeFormatOptions
): string {
  if (!iso) return '';

  const vietnamDate = toVietnamTime(iso);
  if (!vietnamDate) return String(iso);

  // Format the adjusted date
  return vietnamDate.toLocaleString(locale, opts ?? { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Format time only to Vietnam timezone
 * @param iso ISO date string
 * @param locale Locale string (default: 'vi-VN')
 * @returns Formatted time string in Vietnam timezone
 */
export function formatVietnamTime(iso?: string, locale: string = 'vi-VN'): string {
  if (!iso) return '';

  const vietnamDate = toVietnamTime(iso);
  if (!vietnamDate) return String(iso);

  return vietnamDate.toLocaleString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date only to Vietnam timezone
 * @param iso ISO date string
 * @param locale Locale string (default: 'vi-VN')
 * @returns Formatted date string in Vietnam timezone
 */
export function formatVietnamDate(iso?: string, locale: string = 'vi-VN'): string {
  if (!iso) return '';

  const vietnamDate = toVietnamTime(iso);
  if (!vietnamDate) return String(iso);

  return vietnamDate.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get current time in Vietnam timezone
 * @returns Current time in Vietnam timezone
 */
export function getNowVietnamTime(): Date {
  return toVietnamTime(new Date().toISOString()) || new Date();
}
