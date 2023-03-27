import {
  CCDFinancialDetailsLiP,
} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';
import {CCDDQExtraDetails} from 'models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'models/ccdResponse/ccdHearingSupport';

export interface CCDRespondentLiPResponse {
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1MediationLiPResponse?: CCDMediation,
  respondent1DQExtraDetails?: CCDDQExtraDetails,
  respondent1DQHearingSupportLip?: CCDHearingSupport,
  respondent1LiPContactPerson?: string,
  respondent1LiPCorrespondenceAddress?: CCDAddress,
}
