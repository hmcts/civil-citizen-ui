import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDSmallClaimHearing{
  unavailableDatesRequired?: YesNoUpperCamelCase,
  smallClaimUnavailableDate?: CCDUnavailableDates[],
}

export interface CCDUnavailableDates{
  id?: string,
  value?: CCDUnavailableDateItem,
}

 interface CCDUnavailableDateItem {
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
