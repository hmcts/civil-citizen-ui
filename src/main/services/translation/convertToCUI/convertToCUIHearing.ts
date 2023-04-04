import {CCDClaim} from 'models/civilClaimResponse';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {UnavailableDatePeriod, UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CCDUnavailableDates, CCDUnavailableDateType} from 'models/ccdResponse/ccdSmallClaimHearing';

export const toCUIHearing = (ccdClaim: CCDClaim) : Hearing => {
  if(ccdClaim){
    const hearing: Hearing = new Hearing();
    hearing.specificCourtLocation = toCUISpecificCourtLocation(ccdClaim.respondent1DQRequestedCourt);
    if(ccdClaim.respondent1DQHearingSmallClaim){
      hearing.unavailableDatesForHearing.items = toCUIUnavailableDates(ccdClaim.respondent1DQHearingSmallClaim.smallClaimUnavailableDate);
      hearing.cantAttendHearingInNext12Months = toCUIGenericYesNo(ccdClaim.respondent1DQHearingSmallClaim.unavailableDatesRequired);
    }
    if(ccdClaim.respondent1DQHearingSmallClaim){
      hearing.unavailableDatesForHearing.items = toCUIUnavailableDates(ccdClaim.respondent1DQHearingFastClaim.unavailableDates);
      hearing.cantAttendHearingInNext12Months = toCUIGenericYesNo(ccdClaim.respondent1DQHearingFastClaim.unavailableDatesRequired);
    }
    return hearing;
  }
};

export const toCUISpecificCourtLocation = (specificCourtLocation: CCDSpecificCourtLocations) : SpecificCourtLocation=> {
  return new SpecificCourtLocation(toCUIYesNo(specificCourtLocation.requestHearingAtSpecificCourt),specificCourtLocation.caseLocation?.baseLocation,specificCourtLocation.reasonForHearingAtSpecificCourt);
};

function toCUIUnavailableDates(ccdUnavailableDates: CCDUnavailableDates[]) : UnavailableDatePeriod[] {
  if (!ccdUnavailableDates?.length) return undefined;
  return ccdUnavailableDates.map((ccdUnavailableDate: CCDUnavailableDates) => {
    return {
      from: ccdUnavailableDate.value.date,
      until: ccdUnavailableDate.value.toDate,
      type: toCUIUnavailableDateType(ccdUnavailableDate.value.unavailableDateType),
    };
  });
}

function toCUIUnavailableDateType(type: CCDUnavailableDateType) : UnavailableDateType{
  switch(type) {
    case CCDUnavailableDateType.SINGLE_DATE:
      return UnavailableDateType.SINGLE_DATE;
    case  CCDUnavailableDateType.DATE_RANGE:
      return UnavailableDateType.LONGER_PERIOD;
    default:
      return undefined;
  }
}
