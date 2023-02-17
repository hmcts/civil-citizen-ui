import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDRespondentDQ {
  respondent1DQExperts: CCDExperts
  respondent1DQWitnesses: CCDWitnesses
}

export interface CCDExperts {
  expertRequired: YesNoUpperCamelCase;
  expertReportsSent: CcdExpertReportSent;
  jointExpertSuitable: YesNoUpperCamelCase;
  details: CCDExpert []
}

export interface CCDWitnesses {
  witnessesToAppear: YesNoUpperCamelCase;
  details: CCDWitness []
}

export class CCDWitness {
  name: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  reasonForWitness: string;
}
export class CCDExpert {
  name: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  fieldOfExpertise: string;
  whyRequired: string;
  estimatedCost: number;
}

export enum CcdExpertReportSent {
  YES = 'Yes',
  NO = 'No',
  NOT_OBTAINED = 'Not yet obtained'
}
