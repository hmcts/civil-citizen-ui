import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDFinancialDetailsLiP} from 'models/ccdResponse/ccdFinancialDetailsLiP';

import {CCDMediation} from 'models/ccdResponse/ccdMediation';
export interface CCDRespondentLiPResponse {
  partialAdmissionAlreadyPaid?: YesNoUpperCamelCase
  timelineComment?: string
  evidenceComment?: string
}
export interface CCDRespondentLiPResponse {
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1MediationLiPResponse?: CCDMediation,
}
