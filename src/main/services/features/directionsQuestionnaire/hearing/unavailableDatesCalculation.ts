import {
  UnavailableDates,
  UnavailableDateType,
} from "common/models/directionsQuestionnaire/hearing/unavailableDates";

export const getNumberOfUnavailableDays = (unavailableDates: UnavailableDates) => {
  let result: Date[] = [];
  unavailableDates.items.forEach(item => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      result.push(item.from);
    } else {
      const datesBetween = getDatesBetween(item.from, item.until);
      result = [...result, ...datesBetween];
    }
  });
  const uniqueDates = [...new Set(result.map(date => date.toString()))];
  return uniqueDates.length;
}

const getDatesBetween = (startDate: Date, endDate: Date) => {
  const currentDate = new Date(startDate.getTime());
  const dates = [];
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
