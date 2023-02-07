import {UnavailableDatePeriod, UnavailableDates, UnavailableDateType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';

export const getUnavailableDatesForm = (reqBody: Record<string, []>): UnavailableDates => {
  const unavailableDates = reqBody.items.map((item: any) => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      return new UnavailableDatePeriod(UnavailableDateType.SINGLE_DATE, item.single.start, undefined);
    }
    if (item.type === UnavailableDateType.LONGER_PERIOD) {
      return new UnavailableDatePeriod(UnavailableDateType.LONGER_PERIOD, item.period.start, item.period.end);
    }
    return new UnavailableDatePeriod(undefined);
  });
  return new UnavailableDates(unavailableDates);
};