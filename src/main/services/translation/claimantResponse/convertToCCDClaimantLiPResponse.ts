import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {CCDDQExtraDetails} from 'common/models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'common/models/ccdResponse/ccdHearingSupport';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {toCCDYesNoFromBooleanString} from 'services/translation/response/convertToCCDYesNo';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {CourtProposedDateOptions} from 'common/form/models/claimantResponse/courtProposedDate';
import { CourtProposedPlanOptions } from 'common/form/models/claimantResponse/courtProposedPlan';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {convertToCCDEvidenceConfirmDetails} from 'services/translation/response/convertToCCDEvidenceConfirmDetails';
import {CCDEvidenceConfirmDetails} from 'models/ccdResponse/ccdEvidenceConfirmDetails';

export enum CCDChoosesHowToProceed {
  SIGN_A_SETTLEMENT_AGREEMENT = 'SIGN_A_SETTLEMENT_AGREEMENT',
  REQUEST_A_CCJ = 'REQUEST_A_CCJ',
}

export interface CCDClaimantLiPResponse {
  applicant1DQExtraDetails?: CCDDQExtraDetails,
  applicant1DQHearingSupportLip?: CCDHearingSupport,
  applicant1ChoosesHowToProceed?: CCDChoosesHowToProceed,
  applicant1SignedSettlementAgreement?: YesNoUpperCamelCase,
  claimantResponseOnCourtDecision?: CourtProposedDateOptions | CourtProposedPlanOptions,
  claimantCourtDecision?: RepaymentDecisionType,
  applicant1RejectedRepaymentReason?: string,
  applicant1SuggestedImmediatePaymentDeadLine?: Date,
  applicant1DQEvidenceConfirmDetails?: CCDEvidenceConfirmDetails,
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
    claimantResponseOnCourtDecision: claimantResponse?.courtProposedDate?.decision ? claimantResponse?.courtProposedDate?.decision : claimantResponse?.courtProposedPlan?.decision,
    claimantCourtDecision: claimantResponse?.courtDecision ? claimantResponse?.courtDecision : undefined,
    applicant1RejectedRepaymentReason: claimantResponse?.rejectionReason?.text,
    applicant1SuggestedImmediatePaymentDeadLine: claimantResponse?.suggestedImmediatePaymentDeadLine,
    applicant1DQEvidenceConfirmDetails: convertToCCDEvidenceConfirmDetails(claimantResponse?.directionQuestionnaire?.confirmYourDetailsEvidence),
  };
};
