const defaultOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: 'Europe/London',
};

/**
 * A Nunjucks filter to format a date to local time using native Intl.DateTimeFormat.
 * @param date The date object or string to format.
 * @returns The formatted date string.
 */
export function dateTimeFilter(
  date: Date | string,
): string {
  const dateToFormat = date instanceof Date ? date : new Date(date);
  const formattedDate = new Intl.DateTimeFormat('en-GB', defaultOptions).format(dateToFormat);
  return formattedDate.replace(' at', ',');
}
