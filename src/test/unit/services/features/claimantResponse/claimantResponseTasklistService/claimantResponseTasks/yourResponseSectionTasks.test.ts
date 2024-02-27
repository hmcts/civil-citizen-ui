import {TaskStatus} from 'models/taskList/TaskStatus';
import {ClaimantResponse} from 'models/claimantResponse';
import {getSettleTheClaimForTask} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/yourResponseSectionTasks';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {CaseState} from 'form/models/claimDetails';
import {GenericYesNo} from 'form/models/genericYesNo';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Your response section task', () => {
  const claimId = '5129';
  const lang = 'en';

  describe('getSettleTheClaimForTask', () => {
    const resultIncomplete = {
      description: 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE',
      url: '/case/5129/claimant-response/settle-claim',
      status: TaskStatus.INCOMPLETE,
    };

    const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

    it('should return incomplete for no claim', () => {
      //Given
      const claim = new Claim();
      const resultIncompleteNoClaim = {
        description: 'CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_CLAIM_FOR',
        url: '/case/5129/claimant-response/settle-claim',
        status: TaskStatus.INCOMPLETE,
      };
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultIncompleteNoClaim);
    });

    it('should return incomplete for not answer', () => {
      //Given
      const claim=new Claim();
      claim.respondent1=new Party();
      claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
      claim.totalClaimAmount=9000;
      claim.rejectAllOfClaim=new RejectAllOfClaim();
      claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
      claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
      claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
      claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;

      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultIncomplete);
    });

    it('should return incomplete for Full Defence and Paid and hasFullDefenceStatesPaidClaimSettled undefined', () => {
      //Given
      const claim=new Claim();
      claim.respondent1=new Party();
      claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
      claim.totalClaimAmount=9000;
      claim.rejectAllOfClaim=new RejectAllOfClaim();
      claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
      claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
      claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.hasPartPaymentBeenAccepted=new GenericYesNo();
      claim.claimantResponse.hasPartPaymentBeenAccepted.option=YesNo.NO;
      claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;

      claim.claimantResponse = <ClaimantResponse>{ hasFullDefenceStatesPaidClaimSettled: undefined };
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultIncomplete);
    });

    it('should return incomplete for Full Defence and Paid and claimantResponse undefined', () => {
      //Given
      const claim=new Claim();
      claim.respondent1=new Party();
      claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
      claim.totalClaimAmount=9000;
      claim.rejectAllOfClaim=new RejectAllOfClaim();
      claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
      claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
      claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.hasPartPaymentBeenAccepted=new GenericYesNo();
      claim.claimantResponse.hasPartPaymentBeenAccepted.option=YesNo.NO;
      claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = undefined;
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultIncomplete);
    });

    it('should return complete for Full Defence and Paid', () => {
      //Given
      const claim=new Claim();
      claim.respondent1=new Party();
      claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
      claim.totalClaimAmount=9000;
      claim.rejectAllOfClaim=new RejectAllOfClaim();
      claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
      claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
      claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.hasPartPaymentBeenAccepted=new GenericYesNo();
      claim.claimantResponse.hasPartPaymentBeenAccepted.option=YesNo.NO;
      claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = <ClaimantResponse>{ hasFullDefenceStatesPaidClaimSettled: { option: YesNo.YES } };
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultComplete);
    });
  });
});
