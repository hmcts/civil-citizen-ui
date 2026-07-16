import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Mediation} from 'models/mediation/mediation';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CourtProposedDate, CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {SignSettlmentAgreement} from 'form/models/claimantResponse/signSettlementAgreement';
import {CCJRequest} from 'models/claimantResponse/ccj/ccjRequest';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';
import {RejectionReason} from 'form/models/claimantResponse/rejectionReason';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {
  applyTaskListResetRules,
  CLAIMANT_RESPONSE_TASK_LIST_RESET_RULES,
  clearAcceptOrRejectAmountData,
  clearFormaliseRepaymentData,
  clearMediationAndDirectionQuestionnaire,
  clearMediationCarm,
  clearProposeAlternativeRepaymentPlanData,
  clearTaskListData,
  TaskListResetRule,
} from 'services/features/claimantResponse/claimantResponseTaskListReset';

function buildClaimWithTaskListData(): Claim {
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.NO);
  claim.claimantResponse.mediation = new Mediation();
  claim.claimantResponse.mediation.mediationDisagreement = new GenericYesNo(YesNo.YES);
  claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
  claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
  claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
  claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  claim.claimantResponse.courtProposedDate = new CourtProposedDate();
  claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions.JUDGE_REPAYMENT_DATE;
  claim.claimantResponse.rejectionReason = new RejectionReason('rejected');
  claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
  claim.claimantResponse.signSettlementAgreement = <SignSettlmentAgreement>{signed: 'true'};
  claim.claimantResponse.ccjRequest = new CCJRequest();
  claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
  claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
  claim.claimantResponse.mediationCarm = {hasTelephoneMeditationAccessed: true};
  return claim;
}

function buildFullDefenceClaim(option: RejectAllOfClaimType): Claim {
  const claim = buildClaimWithTaskListData();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  claim.rejectAllOfClaim = new RejectAllOfClaim();
  claim.rejectAllOfClaim.option = option;
  return claim;
}

describe('claimantResponseTaskListReset', () => {
  describe('named helpers', () => {
    it('clearMediationCarm removes mediationCarm only', () => {
      const claim = buildClaimWithTaskListData();

      clearMediationCarm(claim);

      expect(claim.claimantResponse.mediationCarm).toBeUndefined();
      expect(claim.claimantResponse.mediation).toBeDefined();
    });

    it('clearFormaliseRepaymentData removes ccj and settlement agreement', () => {
      const claim = buildClaimWithTaskListData();

      clearFormaliseRepaymentData(claim);

      expect(claim.claimantResponse.ccjRequest).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.chooseHowToProceed).toBeDefined();
    });

    it('clearTaskListData removes repayment-plan task list fields', () => {
      const claim = buildClaimWithTaskListData();

      clearTaskListData(claim);

      expect(claim.claimantResponse.suggestedPaymentIntention).toBeUndefined();
      expect(claim.claimantResponse.courtProposedDate).toBeUndefined();
      expect(claim.claimantResponse.rejectionReason).toBeUndefined();
      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeUndefined();
      expect(claim.claimantResponse.courtDecision).toBeUndefined();
    });

    it('clearAcceptOrRejectAmountData removes amount-response and task list fields', () => {
      const claim = buildClaimWithTaskListData();

      clearAcceptOrRejectAmountData(claim);

      expect(claim.claimantResponse.hasPartPaymentBeenAccepted).toBeUndefined();
      expect(claim.claimantResponse.mediation).toBeUndefined();
      expect(claim.claimantResponse.directionQuestionnaire).toBeUndefined();
      expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toBeUndefined();
      expect(claim.claimantResponse.suggestedPaymentIntention).toBeUndefined();
    });

    it('clearProposeAlternativeRepaymentPlanData clears chooseHowToProceed and formalise data', () => {
      const claim = buildClaimWithTaskListData();

      clearProposeAlternativeRepaymentPlanData(claim);

      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
    });

    it('clearMediationAndDirectionQuestionnaire removes mediation and DQ only', () => {
      const claim = buildClaimWithTaskListData();

      clearMediationAndDirectionQuestionnaire(claim);

      expect(claim.claimantResponse.mediation).toBeUndefined();
      expect(claim.claimantResponse.directionQuestionnaire).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeDefined();
    });
  });

  describe('applyTaskListResetRules', () => {
    it('clearMediationCarmWhenSettled: removes mediationCarm when claimant has settled', () => {
      const claim = buildClaimWithTaskListData();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(false);

      applyTaskListResetRules(claim, 'unrelatedProperty');

      expect(claim.claimantResponse.mediationCarm).toBeUndefined();
    });

    it('clearMediationCarmWhenSettled: keeps mediationCarm when claimant has not settled', () => {
      const claim = buildClaimWithTaskListData();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, 'unrelatedProperty');

      expect(claim.claimantResponse.mediationCarm).toEqual({hasTelephoneMeditationAccessed: true});
    });

    it('acceptOrRejectTheAmount: clears amount-response and task list fields', () => {
      const claim = buildClaimWithTaskListData();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, 'hasPartAdmittedBeenAccepted');

      expect(claim.claimantResponse.hasPartPaymentBeenAccepted).toBeUndefined();
      expect(claim.claimantResponse.mediation).toBeUndefined();
      expect(claim.claimantResponse.directionQuestionnaire).toBeUndefined();
      expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toBeUndefined();
      expect(claim.claimantResponse.suggestedPaymentIntention).toBeUndefined();
      expect(claim.claimantResponse.courtProposedDate).toBeUndefined();
      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.courtDecision).toBeUndefined();
      expect(claim.claimantResponse.mediationCarm).toEqual({hasTelephoneMeditationAccessed: true});
    });

    it('acceptOrRejectRepaymentPlan: clears task list data', () => {
      const claim = buildClaimWithTaskListData();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, 'fullAdmitSetDateAcceptPayment');

      expect(claim.claimantResponse.suggestedPaymentIntention).toBeUndefined();
      expect(claim.claimantResponse.courtProposedDate).toBeUndefined();
      expect(claim.claimantResponse.rejectionReason).toBeUndefined();
      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeUndefined();
      expect(claim.claimantResponse.courtDecision).toBeUndefined();
      expect(claim.claimantResponse.mediation).toBeDefined();
    });

    it.each([
      ['paymentOption', 'suggestedPaymentIntention'],
      ['paymentDate', 'suggestedPaymentIntention'],
      ['repaymentPlan', 'suggestedPaymentIntention'],
      ['decision', 'courtProposedDate'],
      ['courtDecision', undefined],
    ])('proposeAlternativeRepaymentPlan: clears formalise data for %s/%s', (propertyName, parentPropertyName) => {
      const claim = buildClaimWithTaskListData();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, propertyName, parentPropertyName);

      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeUndefined();
      expect(claim.claimantResponse.mediation).toBeDefined();
    });

    it('chooseHowToProceed: clears formalise repayment data only', () => {
      const claim = buildClaimWithTaskListData();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, 'option', 'chooseHowToProceed');

      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeUndefined();
      expect(claim.claimantResponse.chooseHowToProceed).toBeDefined();
      expect(claim.claimantResponse.mediation).toBeDefined();
    });

    it('fullDefenceDisputeOrPaidAgreed: clears mediation and DQ for dispute + intentionToProceed', () => {
      const claim = buildFullDefenceClaim(RejectAllOfClaimType.DISPUTE);
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, 'option', 'intentionToProceed');

      expect(claim.claimantResponse.mediation).toBeUndefined();
      expect(claim.claimantResponse.directionQuestionnaire).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeDefined();
    });

    it('fullDefenceDisputeOrPaidAgreed: clears mediation and DQ for already paid + hasFullDefenceStatesPaidClaimSettled', () => {
      const claim = buildFullDefenceClaim(RejectAllOfClaimType.ALREADY_PAID);
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, 'hasFullDefenceStatesPaidClaimSettled');

      expect(claim.claimantResponse.mediation).toBeUndefined();
      expect(claim.claimantResponse.directionQuestionnaire).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest).toBeDefined();
    });

    it('does not apply exclusive rules when property does not match', () => {
      const claim = buildClaimWithTaskListData();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);

      applyTaskListResetRules(claim, 'rejectionReason');

      expect(claim.claimantResponse.mediation).toBeDefined();
      expect(claim.claimantResponse.ccjRequest).toBeDefined();
      expect(claim.claimantResponse.chooseHowToProceed).toBeDefined();
    });

    it('stops after the first exclusive matching rule', () => {
      const applied: string[] = [];
      const rules: TaskListResetRule[] = [
        {
          id: 'firstExclusive',
          when: () => true,
          apply: () => applied.push('firstExclusive'),
        },
        {
          id: 'secondExclusive',
          when: () => true,
          apply: () => applied.push('secondExclusive'),
        },
      ];
      const claim = buildClaimWithTaskListData();

      applyTaskListResetRules(claim, 'any', undefined, rules);

      expect(applied).toEqual(['firstExclusive']);
    });

    it('continues after a continue rule so later exclusive rules can still run', () => {
      const applied: string[] = [];
      const rules: TaskListResetRule[] = [
        {
          id: 'continueRule',
          when: () => true,
          apply: () => applied.push('continueRule'),
          continue: true,
        },
        {
          id: 'exclusiveRule',
          when: () => true,
          apply: () => applied.push('exclusiveRule'),
        },
      ];
      const claim = buildClaimWithTaskListData();

      applyTaskListResetRules(claim, 'any', undefined, rules);

      expect(applied).toEqual(['continueRule', 'exclusiveRule']);
    });

    it('exposes each production rule id exactly once', () => {
      const ruleIds = CLAIMANT_RESPONSE_TASK_LIST_RESET_RULES.map((rule) => rule.id);

      expect(ruleIds).toEqual([
        'clearMediationCarmWhenSettled',
        'acceptOrRejectTheAmount',
        'acceptOrRejectRepaymentPlan',
        'proposeAlternativeRepaymentPlan',
        'chooseHowToProceed',
        'fullDefenceDisputeOrPaidAgreed',
      ]);
    });
  });
});
