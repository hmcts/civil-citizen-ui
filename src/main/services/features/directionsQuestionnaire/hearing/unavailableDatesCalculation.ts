import {
  UnavailableDates,
  UnavailableDateType,
} from "common/models/directionsQuestionnaire/hearing/unavailableDates";

export const getNumberOfUnavailableDays = (unavailableDates: UnavailableDates): number => {
  let result = new Set<string>();
  unavailableDates.items.forEach(item => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      result.add(item.from.toString());
    } else {
      const datesBetween = getDatesBetween(item.from, item.until);
      result = new Set([...result, ...datesBetween])
    }
  });
  return result.size;
}

const getDatesBetween = (startDate: Date, endDate: Date): Set<string> => {
  const currentDate = new Date(startDate.getTime());
  const dates = new Set<string>();
  while (currentDate <= endDate) {
    dates.add(new Date(currentDate).toString());
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
