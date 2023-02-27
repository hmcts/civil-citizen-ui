import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDUnavailableDates} from 'models/ccdResponse/ccdSmallClaimHearing';

export interface CCDFastClaimHearing{
  hearingLength?: undefined;
  hearingLengthHours?: string;
  hearingLengthDays?: string;
  unavailableDatesRequired?: YesNoUpperCamelCase,
  unavailableDates?: CCDUnavailableDates[],
}
