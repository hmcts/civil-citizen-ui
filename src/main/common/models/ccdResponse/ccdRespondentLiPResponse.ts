import {
  CCDFinancialDetailsLiP,
} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';

export interface CCDRespondentLiPResponse {
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1MediationLiPResponse?: CCDMediation,
}
