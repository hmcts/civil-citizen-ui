import {
  CCDFinancialDetailsLiP,
} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {CCDDQExtraDetails} from 'models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'models/ccdResponse/ccdHearingSupport';

export interface CCDRespondentLiPResponse {
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1MediationLiPResponse?: CCDMediation,
  respondent1DQExtraDetails?: CCDDQExtraDetails,
  respondent1DQHearingSupportLip?: CCDHearingSupport,
  respondent1ResponseLanguage?: CCDRespondentResponseLanguage;
}

export enum CCDRespondentResponseLanguage {
  'ENGLISH' = 'ENGLISH',
  'BOTH' = 'BOTH',
}
