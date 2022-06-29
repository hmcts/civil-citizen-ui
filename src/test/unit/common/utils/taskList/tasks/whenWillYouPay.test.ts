import {PaymentIntention} from '../../../../../../main/common/form/models/admission/partialAdmission/paymentIntention';
import PaymentOptionType from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from '../../../../../../main/common/models/claim';
import {PartialAdmission} from '../../../../../../main/common/models/partialAdmission';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getWhenWillYouPayTask} from '../../../../../../main/common/utils/taskList/tasks/whenWillYouPay';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('When will you pay Task', () => {
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.RESPOND_TO_CLAIM.WHEN_WILL_YOU_PAY',
    url: '/case/5129/response/partial-admission/payment-option',
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getWhenWillYouPayTask', () => {

    it('should return incomplete task', () => {
      const claim = new Claim();
      const whenWillYouPayTask = getWhenWillYouPayTask(claim, claimId, lang);
      expect(whenWillYouPayTask).toEqual(resultIncomplete);
    });

    it('should return complete task when paymentOption is IMMEDIATELY', () => {
      const claim  = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      const whenWillYouPayTask = getWhenWillYouPayTask(claim, claimId, lang);
      expect(whenWillYouPayTask).toEqual(resultComplete);
    });

    it('should return complete task when paymentOption is BY_SET_DATE and has paymentDate', () => {
      const claim  = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();
      const whenWillYouPayTask = getWhenWillYouPayTask(claim, claimId, lang);
      expect(whenWillYouPayTask).toEqual(resultComplete);
    });

    it('should return incomplete task when paymentOption is BY_SET_DATE and doesnt has paymentDate', () => {
      const claim  = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      const whenWillYouPayTask = getWhenWillYouPayTask(claim, claimId, lang);
      expect(whenWillYouPayTask).toEqual(resultIncomplete);
    });

    it('should return complete task when paymentOption is INSTALMENTS', () => {
      const claim  = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      const whenWillYouPayTask = getWhenWillYouPayTask(claim, claimId, lang);
      expect(whenWillYouPayTask).toEqual(resultComplete);
    });

  });

});
