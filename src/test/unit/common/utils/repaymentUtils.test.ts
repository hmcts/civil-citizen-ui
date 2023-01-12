import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {ResponseType} from 'common/form/models/responseType';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {FullAdmission} from 'common/models/fullAdmission';
import {PartialAdmission} from 'common/models/partialAdmission';
import {Party} from 'common/models/party';
import {addDaysToDate, addMonths} from 'common/utils/dateUtils';
import {
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount,
  getRepaymentFrequency,
  convertFrequencyToText,
} from 'common/utils/repaymentUtils';
import {createClaimWithBasicRespondentDetails} from '../../../utils/mockClaimForCheckAnswers';
import {t} from 'i18next';

describe('repaymentUtils', () => {

  const WEEKDAYS = 7;
  const claim = createClaimWithBasicRespondentDetails();

  describe('isRepaymentPlanFullOrPartAdmit', () => {
    it('should refer to replayment plan for full admit journey', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      //When
      getPaymentAmount(claim);
      getRepaymentFrequency(claim);
      getFirstRepaymentDate(claim);
      //Then
      expect(claim.fullAdmission?.paymentIntention?.repaymentPlan?.paymentAmount).not.toBeNull();
      expect(claim.fullAdmission?.paymentIntention?.repaymentPlan?.repaymentFrequency).not.toBeNull();
      expect(claim.fullAdmission?.paymentIntention?.repaymentPlan?.firstRepaymentDate).not.toBeNull();
    });

    it('should refer to replayment plan for part admit journey', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      //When
      getPaymentAmount(claim);
      getRepaymentFrequency(claim);
      getFirstRepaymentDate(claim);
      //Then
      expect(claim.partialAdmission?.paymentIntention?.repaymentPlan?.paymentAmount).not.toBeNull();
      expect(claim.partialAdmission?.paymentIntention?.repaymentPlan?.repaymentFrequency).not.toBeNull();
      expect(claim.partialAdmission?.paymentIntention?.repaymentPlan?.firstRepaymentDate).not.toBeNull();
    });
  });

  describe('getFinalPaymentDate for PART_ADMISSION', () => {
    beforeEach(() => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      claim.partialAdmission.howMuchDoYouOwe.amount = 200;
      claim.partialAdmission.howMuchDoYouOwe.totalAmount = 1000;
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(Date.now()),
      };
    });
    it('should return final repayment date when repayment frequency is set to WEEK', () => {
      //Given
      claim.partialAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.WEEK;
      //When
      getPaymentAmount(claim);
      getRepaymentFrequency(claim);
      getFirstRepaymentDate(claim);
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addDaysToDate(claim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, (4 * WEEKDAYS));
      expect(finalRepaymentDate).toEqual(expected);
    });

    it('should return final repayment date when repayment frequency is set to TWO_WEEKS', () => {
      //Given
      claim.partialAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.TWO_WEEKS;
      //When
      getPaymentAmount(claim);
      getRepaymentFrequency(claim);
      getFirstRepaymentDate(claim);
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addDaysToDate(claim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, (8 * WEEKDAYS));
      expect(finalRepaymentDate).toEqual(expected);
    });

    it('should return final repayment date when repayment frequency is set to MONTH', () => {
      //Given
      claim.partialAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.MONTH;
      //When
      getPaymentAmount(claim);
      getRepaymentFrequency(claim);
      getFirstRepaymentDate(claim);
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addMonths(claim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, 4);
      expect(finalRepaymentDate).toEqual(expected);
    });
  });

  describe('getFinalPaymentDate for FULL_ADMISSION', () => {
    beforeEach(() => {
      claim.totalClaimAmount = 200;
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(Date.now()),
      };
    });

    it('should return final repayment date when repayment frequency is set to WEEK', () => {
      //Given
      claim.fullAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.WEEK;
      //When
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addDaysToDate(claim.fullAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, (4 * WEEKDAYS));
      expect(finalRepaymentDate).toEqual(expected);
    });

    it('should return final repayment date when repayment frequency is set to TWO_WEEKS', () => {
      //Given
      claim.fullAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.TWO_WEEKS;
      //When
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addDaysToDate(claim.fullAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, (8 * WEEKDAYS));
      expect(finalRepaymentDate).toEqual(expected);
    });

    it('should return final repayment date when repayment frequency is set to MONTH', () => {
      //Given
      claim.fullAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.MONTH;
      //When
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addMonths(claim.fullAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, 4);
      expect(finalRepaymentDate).toEqual(expected);
    });
  });

  describe('convertFrequencyToText', () => {
    it('should translate frequency weekly to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.WEEK, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.WEEKLY'));
    });
    it('should translate frequency each two week to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.TWO_WEEKS, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.TWO_WEEKS'));
    });
    it('should translate frequency monthly to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.MONTH, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.MONTHLY'));
    });
  });
});
