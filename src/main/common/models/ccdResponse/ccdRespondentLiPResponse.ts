import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {CCDDQExtraDetails} from 'models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'models/ccdResponse/ccdHearingSupport';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';
import {CCDEvidenceConfirmDetails} from 'models/ccdResponse/ccdEvidenceConfirmDetails';

export interface CCDRespondentLiPResponse {
  timelineComment?: string;
  evidenceComment?: string;
  respondent1MediationLiPResponse?: CCDMediation,
  respondent1DQExtraDetails?: CCDDQExtraDetails,
  respondent1DQHearingSupportLip?: CCDHearingSupport,
  respondent1LiPContactPerson?: string,
  respondent1LiPCorrespondenceAddress?: CCDAddress,
  respondent1ResponseLanguage?: CCDRespondentResponseLanguage;
  respondent1DQEvidenceConfirmDetails?: CCDEvidenceConfirmDetails;
}

export enum CCDRespondentResponseLanguage {
  'ENGLISH' = 'ENGLISH',
  'BOTH' = 'BOTH',
  'WELSH' = 'WELSH',
}
