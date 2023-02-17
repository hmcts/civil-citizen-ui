import {
  UnavailableDates,
  UnavailableDateType,
  UnavailableDatePeriod,
} from 'models/directionsQuestionnaire/hearing/unavailableDates';

export const getNumberOfUnavailableDays = (unavailableDates: UnavailableDates): number => {
  if (!unavailableDates) return 0;
  let result = new Set<string>();
  unavailableDates.items.forEach((item: UnavailableDatePeriod) => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      result.add(new Date(item.from).toString());
    } else {
      const datesBetween = getDatesBetween(new Date(item.from), new Date(item.until));
      result = new Set([...result, ...datesBetween]);
    }
  });
  return result.size;
};

const getDatesBetween = (startDate: Date, endDate: Date): Set<string> => {
  const currentDate = new Date(startDate.getTime());
  const dates = new Set<string>();
  while (currentDate <= endDate) {
    dates.add(new Date(currentDate).toString());
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};
