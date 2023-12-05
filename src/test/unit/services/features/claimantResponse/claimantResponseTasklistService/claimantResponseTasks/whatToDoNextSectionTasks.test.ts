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
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CourtProposedDate, CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {CourtProposedPlan, CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {RejectionReason} from 'form/models/claimantResponse/rejectionReason';

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

    const resultComplete = {...resultIncomplete, status: TaskStatus.COMPLETE};

    it('should return incomplete', () => {
      //When
      const acceptOrRejectDefendantAdmittedTask = getAcceptOrRejectDefendantAdmittedTask(claim, claimId, lang);
      //Then
      expect(acceptOrRejectDefendantAdmittedTask).toEqual(resultIncomplete);
    });
    it('should return complete', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{hasPartAdmittedBeenAccepted: {option: YesNo.YES}};
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
      url: '/case/5129/claimant-response/settle-claim',
      status: TaskStatus.INCOMPLETE,
    };

    //When
    const acceptOrTRejectedTheirResponse = getAcceptOrRejectDefendantResponse(claim, '5129', 'en');
    //Then
    expect(acceptOrTRejectedTheirResponse).toEqual(resultIncomplete);
  });

  it('should return incomplete for full defense states paid if claimant responded', () => {
    //Given
    const claim = {claimantResponse: {hasFullDefenceStatesPaidClaimSettled: {option: 'yes'}}} as Claim;
    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE',
      url: '/case/5129/claimant-response/settle-claim',
      status: TaskStatus.INCOMPLETE,
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

    const resultComplete = {...resultIncomplete, status: TaskStatus.COMPLETE};

    it('should return incomplete', () => {
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultIncomplete);
    });

    it('should return complete if no mediation', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation(undefined, {option: YesNo.NO}, undefined, undefined),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

    it('should return complete if canWeUse NO and provide new phone', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation({
          option: YesNo.NO,
          mediationPhoneNumber: '666555444',
        }, {option: YesNo.YES}, undefined, undefined),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

    it('should return complete if canWeUse YES and use same phone', () => {
      //Given
      claim.claimantResponse = <ClaimantResponse>{
        mediation: new Mediation({option: YesNo.YES}, {option: YesNo.YES}, undefined, undefined),
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
          {option: YesNo.YES},
          undefined,
          {option: YesNo.NO, mediationPhoneNumber: '666555444', mediationContactPerson: 'Jon Doe'},
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
          {option: YesNo.YES},
          undefined,
          {option: YesNo.NO, mediationPhoneNumber: '666555444'},
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
          {option: YesNo.YES},
          undefined,
          {option: YesNo.YES, mediationPhoneNumberConfirmation: '666555444'},
        ),
      };
      //When
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      //Then
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

  });

  describe('getProposeAlternativeRepaymentTask', () => {

    it('should return incomplete', () => {
      //When
      const response = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(response.status).toEqual('INCOMPLETE');
    });
    it('should return complete for company', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.COMPANY;
      //When
      const response = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(response.status).toEqual('COMPLETE');
    });
    it('should return complete for suggested immediate', () => {
      //Given
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      //When
      const response = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(response.status).toEqual('COMPLETE');
    });
    it('should return incomplete for suggested installment, payment plan not selected ', () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      //When
      const response = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(response.status).toEqual('INCOMPLETE');
    });

    it('should return incomplete for suggested installment, court proposed date not selected ', () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
        paymentAmount: 1,
        repaymentFrequency: '',
        firstRepaymentDate: new Date(),
      };
      //When
      const response = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(response.status).toEqual('INCOMPLETE');
    });

    it('should return complete for suggested installment, court proposed date  selected ', () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
        paymentAmount: 1,
        repaymentFrequency: '',
        firstRepaymentDate: new Date(),
      };
      claim.claimantResponse.courtProposedPlan = new CourtProposedPlan();
      claim.claimantResponse.courtProposedPlan.decision = CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN;
      claim.claimantResponse.rejectionReason = new RejectionReason();
      claim.claimantResponse.courtProposedDate = new CourtProposedDate();
      claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE;
      //When
      const response = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(response.status).toEqual('COMPLETE');
    });

    it('should return complete for suggested immediate, court proposed plan  selected ', () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
        paymentAmount: 1,
        repaymentFrequency: '',
        firstRepaymentDate: new Date(),
      };
      claim.claimantResponse.courtProposedPlan = new CourtProposedPlan();
      claim.claimantResponse.courtProposedPlan.decision = CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN;
      claim.claimantResponse.rejectionReason = new RejectionReason();
      //When
      const response = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      //Then
      expect(response.status).toEqual('COMPLETE');
    });
  });
});
