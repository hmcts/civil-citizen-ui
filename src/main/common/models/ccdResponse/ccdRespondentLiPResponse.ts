import {
  CCDFinancialDetailsLiP,
} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';

export interface CCDRespondentLiPResponse {
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1MediationLiPResponse?: CCDMediation,
  respondent1LiPContactPerson?: string,
  respondent1LiPCorrespondenceAddress?: CCDAddress,
}
