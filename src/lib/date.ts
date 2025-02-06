import { format } from "date-fns";

export const format_date = (date: string, formatstring: string): string =>
  format(new Date(date), formatstring);
