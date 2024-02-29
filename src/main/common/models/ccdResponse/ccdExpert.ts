import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDExpert{
  expertRequired?: YesNoUpperCamelCase;
  details?: CCDExpertDetails[];
  expertReportsSent ?: CCDExportReportSent;
  jointExpertSuitable?: YesNoUpperCamelCase;
}

export interface CCDDQSupportRequirements {
  supportRequirements?: YesNoUpperCamelCase;
  supportRequirementsAdditional?: string
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

export enum SupportDetails {
  DISABLED_ACCESS = 'Disabled access',
  HEARING_LOOPS = 'Hearing loop',
  SIGN_INTERPRETER = 'Sign language interpreter',
  LANGUAGE_INTERPRETER = 'Language interpreter',
  OTHER_SUPPORT = 'Other support'
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

