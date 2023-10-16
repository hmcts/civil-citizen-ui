import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {CCDDQExtraDetails} from 'common/models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'common/models/ccdResponse/ccdHearingSupport';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {ChooseHowProceed} from 'models/chooseHowProceed';

export enum CCDChoosesHowToProceed {
  SIGN_A_SETTLEMENT_AGREEMENT = 'SIGN_A_SETTLEMENT_AGREEMENT',
  REQUEST_A_CCJ = 'REQUEST_A_CCJ',
}

export interface CCDClaimantLiPResponse {
  applicant1DQExtraDetails?: CCDDQExtraDetails,
  applicant1DQHearingSupportLip?: CCDHearingSupport,
  applicant1ChoosesHowToProceed?: CCDChoosesHowToProceed,
}

function toCCDChoosesHowToProceed(option: ChooseHowProceed | undefined) {
  switch (option) {
    case 'SIGN_A_SETTLEMENT_AGREEMENT':
      return CCDChoosesHowToProceed.SIGN_A_SETTLEMENT_AGREEMENT;
    case 'REQUEST_A_CCJ':
      return CCDChoosesHowToProceed.REQUEST_A_CCJ;
    default:
      return undefined;
  }
}

export const toCCDClaimantLiPResponse = (claimantResponse: ClaimantResponse): CCDClaimantLiPResponse => {
  return {
    applicant1DQExtraDetails: toCCDDQExtraDetails(claimantResponse?.directionQuestionnaire, true),
    applicant1DQHearingSupportLip: toCCDSHearingSupport(claimantResponse?.directionQuestionnaire?.hearing?.supportRequiredList),
    applicant1ChoosesHowToProceed: toCCDChoosesHowToProceed(claimantResponse?.chooseHowToProceed?.option),
  };
};
