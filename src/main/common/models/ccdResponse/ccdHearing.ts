import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDHearing{
  hearingLength?: CCDHearingLength;
  hearingLengthHours?: string,
  hearingLengthDays?: string,
  unavailableDatesRequired?: YesNoUpperCamelCase,
   unavailableDates?: CCDUnavailableDates[],
}

export enum CCDHearingLength {
  LESS_THAN_DAY = 'LESS_THAN_DAY',
  ONE_DAY = 'ONE_DAY',
  MORE_THAN_DAY = 'MORE_THAN_DAY',
}

export interface  CCDUnavailableDates{
  who?: string,
  date?: string,
  fromDate?: string,
  toDate?: string,
  unavailableDateType?: CCDUnavailableDateType,
}

export enum CCDUnavailableDateType{
  SINGLE_DATE = 'SINGLE_DATE',
  DATE_RANGE = 'DATE_RANGE',
}
