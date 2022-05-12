import {DateTime} from 'luxon';


const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('modules/nunjucks/dateFilter');

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
  try {
    const date = DateTime.fromISO(value);
    return date.toLocaleString(DateTime.DATE_FULL, {locale: 'en-gb'});
  } catch (err) {
    logger.error(err);
    throw err;
  }
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
  try {

    let date: DateTime;
    if (typeof value === 'string') {
      if (value === 'now') {
        date = DateTime.now();
      } else {
        date = DateTime.fromISO(value);
      }
    }
    return date.plus({days: num});
  } catch (err) {
    logger.error(err);
    throw err;
  }
}


