import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {CCDDQExtraDetails} from 'common/models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'common/models/ccdResponse/ccdHearingSupport';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {toCCDYesNoFromBooleanString} from 'services/translation/response/convertToCCDYesNo';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';

export enum CCDChoosesHowToProceed {
  SIGN_A_SETTLEMENT_AGREEMENT = 'SIGN_A_SETTLEMENT_AGREEMENT',
  REQUEST_A_CCJ = 'REQUEST_A_CCJ',
}

export interface CCDClaimantLiPResponse {
  applicant1DQExtraDetails?: CCDDQExtraDetails,
  applicant1DQHearingSupportLip?: CCDHearingSupport,
  applicant1ChoosesHowToProceed?: CCDChoosesHowToProceed,
  applicant1SignedSettlementAgreement?: YesNoUpperCamelCase,
  applicant1RejectedRepaymentReason: String,
}

const toChoosesHowToProceed = {
  [ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT] : CCDChoosesHowToProceed.SIGN_A_SETTLEMENT_AGREEMENT,
  [ChooseHowProceed.REQUEST_A_CCJ] : CCDChoosesHowToProceed.REQUEST_A_CCJ,
};

export const toCCDClaimantLiPResponse = (claimantResponse: ClaimantResponse): CCDClaimantLiPResponse => {
  return {
    applicant1DQExtraDetails: toCCDDQExtraDetails(claimantResponse?.directionQuestionnaire, true),
    applicant1DQHearingSupportLip: toCCDSHearingSupport(claimantResponse?.directionQuestionnaire?.hearing?.supportRequiredList),
    applicant1ChoosesHowToProceed: toChoosesHowToProceed[claimantResponse?.chooseHowToProceed?.option],
    applicant1SignedSettlementAgreement: toCCDYesNoFromBooleanString(claimantResponse?.signSettlementAgreement?.signed),
    applicant1RejectedRepaymentReason: claimantResponse?.rejectionReason?.text,
  };
};
