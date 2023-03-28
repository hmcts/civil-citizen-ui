import {
  UnavailableDates,
  UnavailableDateType,
  UnavailableDatePeriod,
} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {formatDateToFullDate} from 'common/utils/dateUtils';

export const getNumberOfUnavailableDays = (unavailableDates: UnavailableDates): number => {
  if (!unavailableDates) return 0;
  const unavailableDateSet  = getListOfUnavailableDate(unavailableDates);
  return unavailableDateSet.size;
};

const getDatesBetween = (startDate: Date, endDate: Date): Set<string> => {
  const dates = new Set<string>();
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.add(formatDateToFullDate(date));
  }
  return dates;
};

export const getListOfUnavailableDate = (unavailableDates: UnavailableDates): Set<string> => {
  const unavailableDateSet = new Set<string>();
  unavailableDates.items.forEach((item: UnavailableDatePeriod) => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      unavailableDateSet.add(formatDateToFullDate(new Date(item.from)));
    }
    if (item.type === UnavailableDateType.LONGER_PERIOD) {
      const datesBetween = getDatesBetween(new Date(item.from), new Date(item.until));
      datesBetween.forEach((date: string) => unavailableDateSet.add(date));
    }
  });
  return unavailableDateSet;
};
