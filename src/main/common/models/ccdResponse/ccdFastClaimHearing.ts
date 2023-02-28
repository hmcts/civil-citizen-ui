import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDUnavailableDates} from 'models/ccdResponse/ccdSmallClaimHearing';

export interface CCDFastClaimHearing{
  hearingLength?: CCDHearingLength;
  hearingLengthHours?: string;
  hearingLengthDays?: string;
  unavailableDatesRequired?: YesNoUpperCamelCase,
  unavailableDates?: CCDUnavailableDates[],
}
export enum CCDHearingLength{
  LESS_THAN_DAY = 'LESS_THAN_DAY',
  ONE_DAY='ONE_DAY',
  MORE_THAN_DAY='MORE_THAN_DAY',
}
