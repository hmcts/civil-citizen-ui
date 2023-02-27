import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {UnavailableDatePeriod, UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {
  CCDUnavailableDateType,
} from 'models/ccdResponse/ccdSmallClaimHearing';

function toCCDUnavailableDateType(type: UnavailableDateType) {
  switch(type) {
    case 'SINGLE_DATE':
      return CCDUnavailableDateType.SINGLE_DATE;
    case  'LONGER_PERIOD':
      return CCDUnavailableDateType.DATE_RANGE;
    default:
      return undefined;
  }
}

function toCCDUnavailableDates(dateDetails: UnavailableDatePeriod[]) {
  if (!dateDetails?.length) return undefined;
  const fastClaimUnavailableDates = dateDetails.map((unavailableDatePeriod: UnavailableDatePeriod) => {
    return {
      value: {
        who: undefined,
        date: unavailableDatePeriod?.from,
        fromDate: unavailableDatePeriod?.from,
        toDate: unavailableDatePeriod?.until,
        unavailableDateType: toCCDUnavailableDateType(unavailableDatePeriod.type),
      },
    };
  });
  return fastClaimUnavailableDates;
}

export const toCCDFastClaimHearing = (hearing: Hearing | undefined) => {
  return {
    hearingLengthHours: '0',
    hearingLengthDays: '0',
    unavailableDatesRequired: toCCDYesNoFromGenericYesNo(hearing?.cantAttendHearingInNext12Months),
    unavailableDates: toCCDUnavailableDates(hearing?.unavailableDatesForHearing?.items),
  };
};
