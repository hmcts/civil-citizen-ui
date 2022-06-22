import {WhyDoYouDisagree} from '../../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {Claim} from '../../../../../../main/common/models/claim';
import {PartialAdmission} from '../../../../../../main/common/models/partialAdmission';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getWhyDisagreeWithAmountClaimedTask} from '../../../../../../main/common/utils/taskList/tasks/whyDisagreeWithAmountClaimed';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Why disagree with amount claimed Task', () => {
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.RESPOND_TO_CLAIM.WHY_DO_YOU_DISAGREE',
    url: '/case/5129/response/partial-admission/why-do-you-disagree',
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getWhyDisagreeWithAmountClaimedTask', () => {

    it('should return incomplete task', () => {
      const claim = new Claim();
      const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(claim, claimId, lang);
      expect(whyDisagreeWithAmountClaimedTask).toEqual(resultIncomplete);
    });

    it('should return complete task', () => {
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree();
      claim.partialAdmission.whyDoYouDisagree.text = 'test';
      const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(claim, claimId, lang);
      expect(whyDisagreeWithAmountClaimedTask).toEqual(resultComplete);
    });

  });

});
