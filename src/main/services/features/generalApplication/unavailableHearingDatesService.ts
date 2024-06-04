import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {UnavailableDatePeriodGaHearing, UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';

export const getUnavailableDatesForHearingForm = (reqBody: Record<string, []>): UnavailableDatesGaHearing => {
  if (!reqBody.items) {
    return new UnavailableDatesGaHearing([]);
  }
  const unavailableDatePeriodHearing  = reqBody.items.map((item: any): UnavailableDatePeriodGaHearing => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      return new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE, item.single.start);
    }
    if (item.type === UnavailableDateType.LONGER_PERIOD) {
      return new UnavailableDatePeriodGaHearing(UnavailableDateType.LONGER_PERIOD, item.period.start, item.period.end);
    }
    return new UnavailableDatePeriodGaHearing();
  });
  return new UnavailableDatesGaHearing(unavailableDatePeriodHearing);
};
