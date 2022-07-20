import {HowMuchHaveYouPaid} from '../../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaim} from '../../../../../../main/common/form/models/rejectAllOfClaim';
import {Claim} from '../../../../../../main/common/models/claim';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getTellUsHowMuchYouHavePaidTask} from '../../../../../../main/common/utils/taskList/tasks/tellUsHowMuchYouHavePaid';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Tell us how much you have paid Task', () => {
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.RESPOND_TO_CLAIM.TELL_US_HOW_MUCH_YOU_HAVE_PAID',
    url: '/case/5129/response/full-rejection/how-much-have-you-paid',
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getTellUsHowMuchYouHavePaidTask', () => {
    const claim = new Claim();

    it('should return incomplete task', () => {
      const giveUsDetailsHearingTask = getTellUsHowMuchYouHavePaidTask(claim, claimId, lang);
      expect(giveUsDetailsHearingTask).toEqual(resultIncomplete);
    });

    it('should return complete task', () => {
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 10;
      const howMuchMoneyAdmitOweTask = getTellUsHowMuchYouHavePaidTask(claim, claimId, lang);
      expect(howMuchMoneyAdmitOweTask).toEqual(resultComplete);
    });
  });

});
