import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDExpert{
  expertRequired?: YesNoUpperCamelCase;
  details?: CCDExpertDetails[];
  expertReportsSent ?: CCDExportReportSent;
  jointExpertSuitable?: YesNoUpperCamelCase;
}

export enum CCDExportReportSent {
  YES = 'YES',
  NO ='NO',
  NOT_OBTAINED = 'NOT_OBTAINED',
}

export interface CCDExpertDetails {
  id?: string,
  value?: CCDExpertDetailsItem,
}

export interface CCDExpertDetailsItem {
  name?: string,
  firstName?: string,
  lastName?: string,
  phoneNumber?: string,
  emailAddress?: string,
  whyRequired?: string,
  fieldOfExpertise?: string,
  estimatedCost?: number,
}

