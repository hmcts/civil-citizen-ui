import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {UnavailableDatePeriod, UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CCDUnavailableDateType} from 'models/ccdResponse/ccdSmallClaimHearing';

function toCCDUnavailableDateType(type: UnavailableDateType) {
  switch(type) {
    case 'SINGLE_DATE':
      return CCDUnavailableDateType.SINGLE_DATE;
    case  'LONGER_PERIOD':
      return CCDUnavailableDateType.DATE_RANGE;
    default:
      return '';
  }
}

function toCCDUnavailableDates(dateDetails: UnavailableDatePeriod[] | undefined) {
  if (!dateDetails?.length) return undefined;
  const unavailableDates = dateDetails.map((unavailableDatePeriod: UnavailableDatePeriod) => {
    return {
      value: {
        who: '',
        date: unavailableDatePeriod?.startDay,
        fromDate: unavailableDatePeriod?.startDay,
        toDate: unavailableDatePeriod?.endDay,
        unavailableDateType: toCCDUnavailableDateType(unavailableDatePeriod.type),
      },
    };
  });
  return unavailableDates;
}

export const toCCDSmallClaimHearing = (hearing: Hearing | undefined) => {
  return {
    unavailableDatesRequired: toCCDYesNoFromGenericYesNo(hearing.cantAttendHearingInNext12Months),
    unavailableDate : toCCDUnavailableDates(hearing.unavailableDatesForHearing.items),
  };
};
