import {CCDFinancialDetailsLiP} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {CCDDQExtraDetails} from 'models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'models/ccdResponse/ccdHearingSupport';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';

export interface CCDRespondentLiPResponse {
  timelineComment?: string;
  evidenceComment?: string;
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1MediationLiPResponse?: CCDMediation,
  respondent1DQExtraDetails?: CCDDQExtraDetails,
  respondent1DQHearingSupportLip?: CCDHearingSupport,
  respondent1LiPContactPerson?: string,
  respondent1LiPCorrespondenceAddress?: CCDAddress,
}
