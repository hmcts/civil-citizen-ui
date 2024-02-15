import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {UnavailableDatePeriodMediation, UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';
import {extractIndexFromAction} from 'common/utils/stringUtils';

export const getUnavailableDatesMediationForm = (reqBody: Record<string, []>): UnavailableDatesMediation => {
  const unavailableDatePeriodMediation  = reqBody.items.map((item: any): UnavailableDatePeriodMediation => {
    if (item.type === UnavailableDateType.SINGLE_DATE) {
      return new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE, item.single.start);
    }
    if (item.type === UnavailableDateType.LONGER_PERIOD) {
      return new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD, item.period.start, item.period.end);
    }
    return new UnavailableDatePeriodMediation();
  });
  return new UnavailableDatesMediation(unavailableDatePeriodMediation);
};

export const addAnother = (unavailableDatesForMediation: UnavailableDatesMediation): void => {
  unavailableDatesForMediation.items.push(new UnavailableDatePeriodMediation());
};

export const removeItem = (unavailableDatesForMediation: UnavailableDatesMediation, action: string  ): void => {
  const index = extractIndexFromAction(action);
  unavailableDatesForMediation.items.splice(Number(index),1);
};
