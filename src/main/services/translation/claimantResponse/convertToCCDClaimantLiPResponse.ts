import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {CCDDQExtraDetails} from 'common/models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'common/models/ccdResponse/ccdHearingSupport';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';

export interface CCDClaimantLiPResponse {
  applicant1DQExtraDetails?: CCDDQExtraDetails,
  applicant1DQHearingSupportLip?: CCDHearingSupport,
  claimantCourtDecision?: RepaymentDecisionType,
}

export const toCCDClaimantLiPResponse = (claimantResponse: ClaimantResponse): CCDClaimantLiPResponse => {
  return {
    applicant1DQExtraDetails: toCCDDQExtraDetails(claimantResponse?.directionQuestionnaire, true),
    applicant1DQHearingSupportLip: toCCDSHearingSupport(claimantResponse?.directionQuestionnaire?.hearing?.supportRequiredList),
    claimantCourtDecision: claimantResponse?.courtDecision ? claimantResponse?.courtDecision : undefined,
  };
};
