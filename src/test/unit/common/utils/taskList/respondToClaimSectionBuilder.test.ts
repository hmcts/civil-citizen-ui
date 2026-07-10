import {Claim} from 'common/models/claim';
import {Party} from 'common/models/party';
import {ResponseType} from 'common/form/models/responseType';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {YesNo} from 'common/form/models/yesNo';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {PartialAdmission} from 'common/models/partialAdmission';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {buildRespondToClaimTasks, isRejectAllAndCounterClaim} from 'common/utils/taskList/respondToClaimSectionBuilder';

describe('respondToClaimSectionBuilder', () => {
  const claimId = '1234';
  const lang = 'en';

  describe('isRejectAllAndCounterClaim', () => {
    it('should return true when reject all option is COUNTER_CLAIM', () => {
      const claim = new Claim();
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.COUNTER_CLAIM;

      expect(isRejectAllAndCounterClaim(claim)).toBe(true);
    });

    it('should return false when reject all option is not COUNTER_CLAIM', () => {
      const claim = new Claim();
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;

      expect(isRejectAllAndCounterClaim(claim)).toBe(false);
    });

    it('should return false when rejectAllOfClaim is undefined', () => {
      const claim = new Claim();

      expect(isRejectAllAndCounterClaim(claim)).toBe(false);
    });
  });

  describe('buildRespondToClaimTasks - Full Admission', () => {
    it('should return only chooseAResponse task when response is full admission but incomplete', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(1);
      expect(tasks[0].status).toBe(TaskStatus.INCOMPLETE);
    });

    it('should include decideHowYouPay task for completed full admission', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(2);
      expect(tasks[0].status).toBe(TaskStatus.COMPLETE);
    });

    it('should include financial details task when payment is by set date', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date();

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(3);
    });

    it('should include repayment plan task when payment is by installments', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      const repaymentPlan = {
        paymentAmount: 100,
        repaymentFrequency: 'MONTH',
        firstRepaymentDate: new Date(),
      };
      claim.fullAdmission.paymentIntention.repaymentPlan = repaymentPlan;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(4);
    });
  });

  describe('buildRespondToClaimTasks - Partial Admission', () => {
    it('should include whyDisagree task for partial admission', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(2);
    });

    it('should include howMuchHaveYouPaid task when already paid is YES', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.YES);

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(3);
      // Verify task ordering: chooseResponse, howMuchPaid, whyDisagree
    });

    it('should include howMuchMoneyAdmitOwe task when already paid is NO', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.NO);

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(3);
    });

    it('should include whenWillYouPay task when amount owed is specified', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.NO);
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      claim.partialAdmission.howMuchDoYouOwe.amount = 500;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(4);
    });

    it('should include financial details task when payment is by set date', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(3);
    });

    it('should include financial details and repayment plan when payment is by installments', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(4);
    });

    it('should not duplicate financial details task when both set date and installments conditions exist', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.partialAdmission.paymentIntention.paymentDate = new Date();

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      // Should only have financial details task once, not twice
      expect(tasks.length).toBe(4); // chooseResponse, financial, whyDisagree, repaymentPlan
    });
  });

  describe('buildRespondToClaimTasks - Full Defence', () => {
    it('should include tellUsHowMuchYouHavePaid task when already paid', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(2);
    });

    it('should include whyDisagreeWithAmount task when paid amount is less than claim amount', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 500;
      claim.totalClaimAmount = 1000;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(3);
    });

    it('should include tellUsWhyDisagree task for dispute', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(2);
    });
  });

  describe('buildRespondToClaimTasks - Counter Claim', () => {
    it('should mark chooseAResponse task as incomplete for counter claim', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.COUNTER_CLAIM;

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks.length).toBe(1);
      expect(tasks[0].status).toBe(TaskStatus.INCOMPLETE);
    });
  });
});
