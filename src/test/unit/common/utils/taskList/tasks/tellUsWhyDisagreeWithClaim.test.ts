import {Defence} from '../../../../../../main/common/form/models/defence';
import {Claim} from '../../../../../../main/common/models/claim';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getTellUsWhyDisagreeWithClaimTask} from '../../../../../../main/common/utils/taskList/tasks/tellUsWhyDisagreeWithClaim';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Tell us why you disagree with the claim Task', () => {
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.RESPOND_TO_CLAIM.TELL_US_WHY_DISAGREE_WITH_CLAIM',
    url: '/case/5129/response/your-defence',
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getTellUsWhyDisagreeWithClaimTask', () => {
    const claim = new Claim();

    it('should return incomplete task', () => {
      const giveUsDetailsHearingTask = getTellUsWhyDisagreeWithClaimTask(claim, claimId, lang);
      expect(giveUsDetailsHearingTask).toEqual(resultIncomplete);
    });

    it('should return complete task', () => {
      claim.defence = new Defence();
      claim.defence.text = 'test';
      const howMuchMoneyAdmitOweTask = getTellUsWhyDisagreeWithClaimTask(claim, claimId, lang);
      expect(howMuchMoneyAdmitOweTask).toEqual(resultComplete);
    });
  });

});
