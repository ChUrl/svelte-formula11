import { format } from "date-fns";

/**
 * 2025-03-28T17:35
 */
export const isodatetimeformat: string = "yyyy-MM-dd'T'HH:mm";

/**
 * 28.03. 17:35
 */
export const shortdatetimeformat: string = "dd.MM.' 'HH:mm";

/**
 * 2025-03-28
 */
export const isodateformat: string = "yyyy-MM-dd";

/**
 * 17:35
 */
export const timeformat: string = "HH:mm";

/**
 * Format a [Date] object using a [date-fns] formatstring.
 * This function uses localtime instead of UTC.
 */
export const format_date = <T extends Date | string>(date: T, formatstring: string): string => {
  if (!date) return "";

  return format(new Date(date), formatstring);
};
