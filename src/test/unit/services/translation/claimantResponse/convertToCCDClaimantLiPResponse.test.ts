import {ClaimantResponse} from 'common/models/claimantResponse';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {
  CCDChoosesHowToProceed,
  toCCDClaimantLiPResponse,
} from 'services/translation/claimantResponse/convertToCCDClaimantLiPResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {CourtProposedDate} from 'common/form/models/claimantResponse/courtProposedDate';
import {CourtProposedDateOptions} from 'common/form/models/claimantResponse/courtProposedDate';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';

describe('toCCDClaimantLiPResponse', () => {
  it('should map undefined claimant response fields to undefined values', () => {
    const result = toCCDClaimantLiPResponse(undefined as unknown as ClaimantResponse);

    expect(result.applicant1ChoosesHowToProceed).toBeUndefined();
    expect(result.applicant1SignedSettlementAgreement).toBeUndefined();
    expect(result.claimantResponseOnCourtDecision).toBeUndefined();
    expect(result.claimantCourtDecision).toBeUndefined();
    expect(result.applicant1RejectedRepaymentReason).toBeUndefined();
    expect(result.applicant1SuggestedImmediatePaymentDeadLine).toBeUndefined();
  });

  it('should map populated claimant response fields', () => {
    const claimantResponse = new ClaimantResponse();
    claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    claimantResponse.chooseHowToProceed = {option: ChooseHowProceed.REQUEST_A_CCJ};
    claimantResponse.signSettlementAgreement = {signed: 'true'};
    claimantResponse.courtProposedDate = {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE} as CourtProposedDate;
    claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    claimantResponse.rejectionReason = {text: 'not acceptable'};
    const deadline = new Date('2024-01-15');
    claimantResponse.suggestedImmediatePaymentDeadLine = deadline;

    const result = toCCDClaimantLiPResponse(claimantResponse);

    expect(result.applicant1ChoosesHowToProceed).toBe(CCDChoosesHowToProceed.REQUEST_A_CCJ);
    expect(result.applicant1DQExtraDetails).toBeDefined();
    expect(result.claimantResponseOnCourtDecision).toBe(CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE);
    expect(result.claimantCourtDecision).toBe(RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT);
    expect(result.applicant1RejectedRepaymentReason).toBe('not acceptable');
    expect(result.applicant1SuggestedImmediatePaymentDeadLine).toEqual(deadline);
  });

  it('should map settlement agreement choose how to proceed', () => {
    const claimantResponse = new ClaimantResponse();
    claimantResponse.chooseHowToProceed = {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT};

    expect(toCCDClaimantLiPResponse(claimantResponse).applicant1ChoosesHowToProceed)
      .toBe(CCDChoosesHowToProceed.SIGN_A_SETTLEMENT_AGREEMENT);
  });
});
