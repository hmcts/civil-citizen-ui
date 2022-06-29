import { HowMuchHaveYouPaid } from '../../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {Claim} from '../../../../../../main/common/models/claim';
import {PartialAdmission} from '../../../../../../main/common/models/partialAdmission';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import { getHowMuchHaveYouPaidTask } from '../../../../../../main/common/utils/taskList/tasks/howMuchHaveYouPaid';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('How much money admit owe Task', () => {
  const claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.RESPOND_TO_CLAIM.HOW_MUCH_HAVE_YOU_PAID',
    url: '/case/5129/response/partial-admission/how-much-have-you-paid',
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getHowMuchHaveYouPaidTask', () => {

    it('should return incomplete task', () => {
      const howMuchMoneyAdmitOweTask = getHowMuchHaveYouPaidTask(claim, claimId, lang);
      expect(howMuchMoneyAdmitOweTask).toEqual(resultIncomplete);
    });

    it('should return incomplete task when missing amount, date or text', () => {
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid({amount:1});
      const howMuchMoneyAdmitOweTask = getHowMuchHaveYouPaidTask(claim, claimId, lang);
      expect(howMuchMoneyAdmitOweTask).toEqual(resultIncomplete);
    });

    it('should return complete task when has amount, date and text', () => {
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      claim.partialAdmission.howMuchHaveYouPaid.amount = 1;
      claim.partialAdmission.howMuchHaveYouPaid.date = new Date();
      claim.partialAdmission.howMuchHaveYouPaid.text = 'test';
      const howMuchMoneyAdmitOweTask = getHowMuchHaveYouPaidTask(claim, claimId, lang);
      expect(howMuchMoneyAdmitOweTask).toEqual(resultComplete);
    });

  });

});
