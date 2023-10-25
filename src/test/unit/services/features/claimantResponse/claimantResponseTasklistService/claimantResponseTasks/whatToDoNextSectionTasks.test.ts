import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {Mediation} from 'common/models/mediation/mediation';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {
  getAcceptOrRejectDefendantAdmittedTask,
  getAcceptOrRejectDefendantResponse,
  getFreeTelephoneMediationTask,
  getProposeAlternativeRepaymentTask,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/whatToDoNextSectionTasks';
import {CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('What to do next section task', () => {
  const claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  describe('getAcceptOrRejectDefendantAdmittedTask', () => {

    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED',
      url: '/case/5129/claimant-response/settle-admitted',
      status: TaskStatus.INCOMPLETE,
    };

    const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

    it('should return incomplete', () => {
      //When
      const acceptOrRejectDefendantAdmittedTask = getAcceptOrRejectDefendantAdmittedTask(claim, claimId, lang);
      //Then
      expect(acceptOrRejectDefendantAdmittedTask).toEqual(resultIncomplete);
    });
    it('should return complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{ hasPartAdmittedBeenAccepted: { option: YesNo.YES } };
      //When
      const acceptOrRejectDefendantAdmittedTask = getAcceptOrRejectDefendantAdmittedTask(claim, claimId, lang);
      //Then
      expect(acceptOrRejectDefendantAdmittedTask).toEqual(resultComplete);
    });
  });

  it('should return incomplete for full defense states paid', () => {
    //Given
    const claim = {} as Claim;
    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE',
      url: '/case/5129/claimant-response/settle-admitted',
      status: TaskStatus.INCOMPLETE,
    };

    //When
    const acceptOrTRejectedTheirResponse = getAcceptOrRejectDefendantResponse(claim, '5129', 'en');
    //Then
    expect(acceptOrTRejectedTheirResponse).toEqual(resultIncomplete);
  });

  it('should return complete for full defense states paid if claimant responded', () => {
    //Given
    const claim = { claimantResponse: { hasFullDefenceStatesPaidClaimSettled: { option: 'yes' } } } as Claim;
    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE',
      url: '/case/5129/claimant-response/settle-admitted',
      status: TaskStatus.COMPLETE,
    };

    //When
    const acceptOrTRejectedTheirResponse = getAcceptOrRejectDefendantResponse(claim, '5129', 'en');
    //Then
    expect(acceptOrTRejectedTheirResponse).toEqual(resultIncomplete);
  });

  describe('getFreeTelephoneMediationTask', () => {

    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION',
      url: '/case/5129/mediation/free-telephone-mediation',
      status: TaskStatus.INCOMPLETE,
    };

    const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

    it('should return incomplete', () => {
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultIncomplete);
    });

    it('should return complete if no mediation', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation(undefined, { option: YesNo.NO }, undefined, undefined),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

    it('should return complete if canWeUse NO and provide new phone', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation({ option: YesNo.NO, mediationPhoneNumber: '666555444' }, { option: YesNo.YES }, undefined, undefined),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

    it('should return complete if canWeUse YES and use same phone', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation({ option: YesNo.YES }, { option: YesNo.YES }, undefined, undefined),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

    it('should return complete if companyTelephoneNumber NO', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation(
          undefined,
          { option: YesNo.YES },
          undefined,
          { option: YesNo.NO, mediationPhoneNumber: '666555444', mediationContactPerson: 'Jon Doe' },
        ),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

    it('should return incomplete if companyTelephoneNumber NO and doesnt has contact person', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation(
          undefined,
          { option: YesNo.YES },
          undefined,
          { option: YesNo.NO, mediationPhoneNumber: '666555444' },
        ),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultIncomplete);
    });

    it('should return complete if companyTelephoneNumber YES', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation(
          undefined,
          { option: YesNo.YES },
          undefined,
          { option: YesNo.YES, mediationPhoneNumberConfirmation: '666555444' },
        ),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

  });
  describe('getProposeAlternativeRepaymentTask', () => {

    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT',
      url: '/case/5129/claimant-response/payment-option',
      status: TaskStatus.INCOMPLETE,
    };

    const resultComplete = {...resultIncomplete, status: TaskStatus.COMPLETE};

    it('should return incomplete', () => {
      //When
      const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(proposeAlternativeRepayment).toEqual(resultIncomplete);
    });
    it('should return complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE},
      };
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.IMMEDIATELY},
      };
      //When
      const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(proposeAlternativeRepayment).toEqual(resultComplete);
    });

    it('should return complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        courtProposedPlan: {decision: CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN},
      };
      //When
      const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(proposeAlternativeRepayment).toEqual(resultComplete);
    });

    it('should return complete', () => {
      //Given
      claim.partialAdmission = {
        paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date()},
      };
      //When
      const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(proposeAlternativeRepayment).toEqual(resultComplete);
    });
  });
});
