import {WhyDoYouDisagree} from '../../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {RejectAllOfClaim} from '../../../../../../main/common/form/models/rejectAllOfClaim';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';
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

  const resultIncompletePA = {
    description: 'TASK_LIST.RESPOND_TO_CLAIM.WHY_DO_YOU_DISAGREE',
    url: '/case/5129/response/partial-admission/why-do-you-disagree',
    status: TaskStatus.INCOMPLETE,
  };

  const resultCompletePA = { ...resultIncompletePA, status: TaskStatus.COMPLETE };

  const resultIncompleteFD = { ...resultIncompletePA, url: '/case/5129/response/full-rejection/why-do-you-disagree' };
  const resultCompleteFD = { ...resultIncompleteFD, status: TaskStatus.COMPLETE };

  describe('getWhyDisagreeWithAmountClaimedTask', () => {

    describe('partial admission', () => {
      it('should return incomplete task', () => {
        const claim = new Claim();
        const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(claim, claimId, ResponseType.PART_ADMISSION, lang);
        expect(whyDisagreeWithAmountClaimedTask).toEqual(resultIncompletePA);
      });
      it('should return complete task', () => {
        const claim = new Claim();
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree();
        claim.partialAdmission.whyDoYouDisagree.text = 'test';
        const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(claim, claimId, ResponseType.PART_ADMISSION, lang);
        expect(whyDisagreeWithAmountClaimedTask).toEqual(resultCompletePA);
      });
    });

    describe('full rejection', () => {
      it('should return incomplete task', () => {
        const claim = new Claim();
        const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(claim, claimId, ResponseType.FULL_DEFENCE, lang);
        expect(whyDisagreeWithAmountClaimedTask).toEqual(resultIncompleteFD);
      });
      it('should return complete task', () => {
        const claim = new Claim();
        claim.rejectAllOfClaim = new RejectAllOfClaim();
        claim.rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree();
        claim.rejectAllOfClaim.whyDoYouDisagree.text = 'test';
        const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(claim, claimId, ResponseType.FULL_DEFENCE, lang);
        expect(whyDisagreeWithAmountClaimedTask).toEqual(resultCompleteFD);
      });
    });
  });

});
