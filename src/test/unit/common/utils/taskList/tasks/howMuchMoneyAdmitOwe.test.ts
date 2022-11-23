import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {Claim} from 'common/models/claim';
import {PartialAdmission} from 'common/models/partialAdmission';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {getHowMuchMoneyAdmitOweTask} from 'common/utils/taskList/tasks/howMuchMoneyAdmitOwe';

jest.mock('modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('How much money admit owe Task', () => {
  const claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.RESPOND_TO_CLAIM.HOW_MUCH_MONEY_ADMIT_OWE',
    url: '/case/5129/response/partial-admission/how-much-do-you-owe',
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getHowMuchMoneyAdmitOweTask', () => {

    it('should return incomplete task', () => {
      const howMuchMoneyAdmitOweTask = getHowMuchMoneyAdmitOweTask(claim, claimId, lang);
      expect(howMuchMoneyAdmitOweTask).toEqual(resultIncomplete);
    });

    it('should return complete task', () => {
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(500);
      const howMuchMoneyAdmitOweTask = getHowMuchMoneyAdmitOweTask(claim, claimId, lang);
      expect(howMuchMoneyAdmitOweTask).toEqual(resultComplete);
    });

  });

});
