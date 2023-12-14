import {TaskStatus} from 'models/taskList/TaskStatus';
import {ClaimantResponse} from 'models/claimantResponse';
import {getSettleTheClaimForTask} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/yourResponseSectionTasks';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';

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
      const claim = {
        isFullDefence: jest.fn(),
        hasPaidInFull: jest.fn(),
        isRejectAllOfClaimAlreadyPaid: jest.fn(),
        hasClaimantRejectedPartAdmitPayment: jest.fn(),
      } as any;
      claim.isFullDefence.mockReturnValue(true);
      claim.hasPaidInFull.mockReturnValue(true);
      claim.isRejectAllOfClaimAlreadyPaid.mockReturnValue(true);
      claim.hasClaimantRejectedPartAdmitPayment.mockReturnValue(false);
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultIncomplete);
    });

    it('should return incomplete for Full Defence and Paid and hasFullDefenceStatesPaidClaimSettled undefined', () => {
      //Given
      const claim = {
        isFullDefence: jest.fn(),
        hasPaidInFull: jest.fn(),
        isRejectAllOfClaimAlreadyPaid: jest.fn(),
        hasClaimantRejectedPartAdmitPayment: jest.fn(),
      } as any;
      claim.isFullDefence.mockReturnValue(true);
      claim.hasPaidInFull.mockReturnValue(true);
      claim.isRejectAllOfClaimAlreadyPaid.mockReturnValue(true);
      claim.hasClaimantRejectedPartAdmitPayment.mockReturnValue(true);
      claim.claimantResponse = <ClaimantResponse>{ hasFullDefenceStatesPaidClaimSettled: undefined };
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultIncomplete);
    });

    it('should return incomplete for Full Defence and Paid and claimantResponse undefined', () => {
      //Given
      const claim = {
        isFullDefence: jest.fn(),
        hasPaidInFull: jest.fn(),
        isRejectAllOfClaimAlreadyPaid: jest.fn(),
        hasClaimantRejectedPartAdmitPayment: jest.fn(),
      } as any;
      claim.isFullDefence.mockReturnValue(true);
      claim.hasPaidInFull.mockReturnValue(true);
      claim.isRejectAllOfClaimAlreadyPaid.mockReturnValue(true);
      claim.hasClaimantRejectedPartAdmitPayment.mockReturnValue(true);
      claim.claimantResponse = undefined;
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultIncomplete);
    });

    it('should return complete for Full Defence and Paid', () => {
      //Given
      const claim = {
        isFullDefence: jest.fn(),
        hasPaidInFull: jest.fn(),
        isRejectAllOfClaimAlreadyPaid: jest.fn(),
        hasClaimantRejectedPartAdmitPayment: jest.fn(),
      } as any;
      claim.isFullDefence.mockReturnValue(true);
      claim.hasPaidInFull.mockReturnValue(true);
      claim.isRejectAllOfClaimAlreadyPaid.mockReturnValue(true);
      claim.hasClaimantRejectedPartAdmitPayment.mockReturnValue(true);
      claim.claimantResponse = <ClaimantResponse>{ hasFullDefenceStatesPaidClaimSettled: { option: YesNo.YES } };
      //When
      const settleTheClaimForTask = getSettleTheClaimForTask(claim, claimId, lang);
      //Then
      expect(settleTheClaimForTask).toEqual(resultComplete);
    });
  });
});
