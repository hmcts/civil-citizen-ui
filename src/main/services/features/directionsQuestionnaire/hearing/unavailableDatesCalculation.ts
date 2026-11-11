import {
  UnavailableDates,
  UnavailableDateType,
  UnavailableDatePeriod,
} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {formatDateToFullDate} from 'common/utils/dateUtils';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('unavailableDatesCalculation');

export const getNumberOfUnavailableDays = (unavailableDates?: UnavailableDates): number => {
  if (!unavailableDates) return 0;
  const unavailableDateSet  = getListOfUnavailableDate(unavailableDates);
  return unavailableDateSet.size;
};

const isValidDate = (value?: Date): value is Date =>
  !!value && !isNaN(new Date(value).getTime());

const getDatesBetween = (startDate: Date, endDate: Date, lng?: string): Set<string> => {
  const dates = new Set<string>();
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.add(formatDateToFullDate(date, lng));
  }
  return dates;
};

export const getListOfUnavailableDate = (unavailableDates: UnavailableDates, lng?: string): Set<string> => {
  const unavailableDateSet = new Set<string>();
  if (!unavailableDates?.items?.length) {
    logger.info('No unavailable dates found');
    return unavailableDateSet;
  }
  unavailableDates.items.forEach((item: UnavailableDatePeriod, index: number) => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      if (!isValidDate(item.from)) {
        logger.warn(`[getListOfUnavailableDate] SINGLE_DATE item ${index} has missing or invalid from date, skipping`);
        return;
      }
      unavailableDateSet.add(formatDateToFullDate(new Date(item.from), lng));
    }
    if (item.type === UnavailableDateType.LONGER_PERIOD) {
      if (!isValidDate(item.from) || !isValidDate(item.until)) {
        logger.warn(`[getListOfUnavailableDate] LONGER_PERIOD item ${index} has missing or invalid from/until date, skipping`);
        return;
      }
      const datesBetween = getDatesBetween(new Date(item.from), new Date(item.until), lng);
      datesBetween.forEach((date: string) => unavailableDateSet.add(date));
    }
  });
  return unavailableDateSet;
};
