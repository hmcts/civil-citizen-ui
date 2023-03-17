import {
  CCDFinancialDetailsLiP,
} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';

export interface CCDRespondentLiPResponse {
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1MediationLiPResponse?: CCDMediation,
  respondent1ResponseLanguage?: CCDRespondentResponseLanguage;
}

export enum CCDRespondentResponseLanguage {
  'ENGLISH' = 'ENGLISH',
  'BOTH' = 'BOTH',
}
