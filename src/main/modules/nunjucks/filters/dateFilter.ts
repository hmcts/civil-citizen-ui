import { DateFormatter } from 'common/utils/dateFormatter';
import {DateTime} from 'luxon';

/* *
 * This filter should be used when you need a date in long format for content
 *
 * Usage (in njk):
 * {{ myDateVar | date }}
 *
 * output:
 *  6 April 2018
 * */
export function dateFilter(value: string): string {
  const date = DateTime.fromISO(value);
  return date.toLocaleString(DateTime.DATE_FULL, {locale: 'en-gb'});
}

/**
 * This filter should be used when you want to display long format from date format dd-MM-yyyy
 * usage (in njk):
 * {{myDateVar | formatDate}}
 * output:
 *   6 April 2018
 * @param value
 */
export function formatDate(value:string): string {
  if(value === undefined || value === ''){
    return '';
  }
  const date = DateTime.fromFormat(value, 'dd-MM-yyyy');
  return date.toLocaleString(DateTime.DATE_FULL, {locale: 'en-gb'});
}

/* *
 * This filter should be used when you need to dynamically modify a date. The keyword 'now' may be given as
 * input to generate dates relative to the current date.
 *
 * Usage (in njk):
 * Example 1:
 * {{ someMoment | addDays(1) }}
 *
 * output:
 *  a moment representing the day after that given
 *
 * Example 2:
 * {{ 'now' | addDays(-7) }}
 *
 * output:
 *  a moment representing the date 1 week before today
 */
export function addDaysFilter(value: string, num: number): DateTime {
  let date: DateTime;
  if (typeof value === 'string') {
    if (value === 'now') {
      date = DateTime.now();
    } else {
      date = DateTime.fromISO(value);
    }
  }
  return date.plus({days: num});
}

export function addDaysFilterTranslated(value: string, num: number, t: (key: string) => string, format?: string): string {
  const newDate = addDaysFilter(value, num);
  const month = t('COMMON.MONTH_NAMES.' + newDate.monthLong.toUpperCase());
  if (format === 'GB') {
    return DateFormatter.setDateFormat(newDate.toJSDate(), 'en-GB', {
      day: 'numeric', month: '2-digit', year: 'numeric',
    });
  }

  return (newDate.day + ' ' + month + ' ' + newDate.year);
}
