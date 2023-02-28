import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {UnavailableDatePeriod, UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {
  CCDUnavailableDateType,
} from 'models/ccdResponse/ccdSmallClaimHearing';
import {CCDHearingLength} from 'models/ccdResponse/ccdFastClaimHearing';

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
  //added first 3 field as a placeholder and using just random value as we don't have CUI fields to set those
  //values but mandatory field in CCD.
  return {
    hearingLength:CCDHearingLength.ONE_DAY,
    hearingLengthHours: '3',
    hearingLengthDays: '1',
    unavailableDatesRequired: toCCDYesNoFromGenericYesNo(hearing?.cantAttendHearingInNext12Months),
    unavailableDates: toCCDUnavailableDates(hearing?.unavailableDatesForHearing?.items),
  };
};
