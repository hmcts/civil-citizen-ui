import moment from 'moment';

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
    const date = moment(value);
    if (!date.isValid()) {
      throw new Error('Invalid date');
    }
    return date.format('D MMMM YYYY');
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
export function addDaysFilter(value: moment.Moment | string, num: number): moment.Moment {
  try {
    if (!value || !(typeof value === 'string' || value instanceof moment)) {
      throw new Error('Input should be moment or string, cannot be empty');
    }

    let date: moment.Moment;
    if (typeof value === 'string') {
      if (value === 'now') {
        date = moment().hours(0).minutes(0).seconds(0).milliseconds(0);
      } else {
        date = moment(value);
      }
    } else {
      date = value.clone();
    }
    if (!date.isValid()) {
      throw new Error('Invalid date');
    }
    return date.add(num, 'day');
  } catch (err) {
    logger.error(err);
    throw err;
  }
}


