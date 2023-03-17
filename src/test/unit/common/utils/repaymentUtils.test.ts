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
  getRepaymentLength,
  getAmount,
  getPaymentDate,
} from 'common/utils/repaymentUtils';
import {createClaimWithBasicRespondentDetails} from '../../../utils/mockClaimForCheckAnswers';
import {t} from 'i18next';
import {YesNo} from 'common/form/models/yesNo';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from 'common/models/claim';

const getClaimForFA = (repaymentFrequency: TransactionSchedule, paymentAmount?: number) => {
  const amount = paymentAmount ? paymentAmount : 50;
  const claim = new Claim();
  const respondent1 = new Party();
  respondent1.responseType = ResponseType.FULL_ADMISSION;
  claim.totalClaimAmount = 1000;
  claim.respondent1 = respondent1;
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
  claim.fullAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: amount,
    repaymentFrequency: repaymentFrequency,
    firstRepaymentDate: new Date(Date.now()),
  };
  return claim;
};

const getClaimForPA = (repaymentFrequency: TransactionSchedule, paymentAmount?: number) => {
  const amount = paymentAmount ? paymentAmount : 50;
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
  claim.partialAdmission.alreadyPaid = {
    option: YesNo.NO,
  };
  claim.partialAdmission.howMuchDoYouOwe.amount = 200;
  claim.partialAdmission.howMuchDoYouOwe.totalAmount = 1000;
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: amount,
    repaymentFrequency: repaymentFrequency,
    firstRepaymentDate: new Date(Date.now()),
  };
  return claim;
};

describe('repaymentUtils', () => {

  const WEEKDAYS = 7;
  const claim = createClaimWithBasicRespondentDetails();

  describe('isRepaymentPlanFullOrPartAdmit', () => {
    it.concurrent('should refer to repayment plan for full admit journey', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      //When
      getPaymentAmount(claim);
      getRepaymentFrequency(claim);
      getFirstRepaymentDate(claim);
      getPaymentDate(claim);
      //Then
      expect(claim.fullAdmission?.paymentIntention?.repaymentPlan?.paymentAmount).not.toBeNull();
      expect(claim.fullAdmission?.paymentIntention?.repaymentPlan?.repaymentFrequency).not.toBeNull();
      expect(claim.fullAdmission?.paymentIntention?.repaymentPlan?.firstRepaymentDate).not.toBeNull();
      expect(claim.fullAdmission?.paymentIntention?.paymentDate).not.toBeNull();
    });

    it.concurrent('should refer to repayment plan for part admit journey', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      //When
      getPaymentAmount(claim);
      getRepaymentFrequency(claim);
      getFirstRepaymentDate(claim);
      getPaymentDate(claim);
      //Then
      expect(claim.partialAdmission?.paymentIntention?.repaymentPlan?.paymentAmount).not.toBeNull();
      expect(claim.partialAdmission?.paymentIntention?.repaymentPlan?.repaymentFrequency).not.toBeNull();
      expect(claim.partialAdmission?.paymentIntention?.repaymentPlan?.firstRepaymentDate).not.toBeNull();
      expect(claim.partialAdmission?.paymentIntention?.paymentDate).not.toBeNull();
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
    it.concurrent('should return final repayment date when repayment frequency is set to WEEK', () => {
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

    it.concurrent('should return final repayment date when repayment frequency is set to TWO_WEEKS', () => {
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

    it.concurrent('should return final repayment date when repayment frequency is set to MONTH', () => {
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

    it.concurrent('should return final repayment date when repayment frequency is set to WEEK', () => {
      //Given
      claim.fullAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.WEEK;
      //When
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addDaysToDate(claim.fullAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, (4 * WEEKDAYS));
      expect(finalRepaymentDate).toEqual(expected);
    });

    it.concurrent('should return final repayment date when repayment frequency is set to TWO_WEEKS', () => {
      //Given
      claim.fullAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.TWO_WEEKS;
      //When
      const finalRepaymentDate = getFinalPaymentDate(claim);
      //Then
      const expected = addDaysToDate(claim.fullAdmission.paymentIntention.repaymentPlan.firstRepaymentDate, (8 * WEEKDAYS));
      expect(finalRepaymentDate).toEqual(expected);
    });

    it.concurrent('should return final repayment date when repayment frequency is set to MONTH', () => {
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
    it.concurrent('should translate frequency weekly to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.WEEK, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.WEEKLY'));
    });
    it.concurrent('should translate frequency each two week to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.TWO_WEEKS, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.TWO_WEEKS'));
    });
    it.concurrent('should translate frequency monthly to text', () => {
      const result = convertFrequencyToText(TransactionSchedule.MONTH, 'en');
      expect(result).toBe(t('COMMON.FREQUENCY_OF_PAYMENTS.MONTHLY'));
    });
  });

  describe('getRepaymentFrequency', () => {
    it.concurrent('should return weekly payment frequency of repayment plan when response type is full admission', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.WEEK);
      //When
      const result = getRepaymentFrequency(claim);
      //Then
      expect(result).toBe(TransactionSchedule.WEEK);
    });

    it.concurrent('should return two weeks payment frequency of repayment plan when response type is full admission', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.TWO_WEEKS);
      //When
      const result = getRepaymentFrequency(claim);
      //Then
      expect(result).toBe(TransactionSchedule.TWO_WEEKS);
    });

    it.concurrent('should return monthly payment frequency of repayment plan when response type is full admission', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.MONTH);
      //When
      const result = getRepaymentFrequency(claim);
      //Then
      expect(result).toBe(TransactionSchedule.MONTH);
    });

    it.concurrent('should return weekly payment frequency of repayment plan when response type is part admission', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.WEEK);
      //When
      const result = getRepaymentFrequency(claim);
      //Then
      expect(result).toBe(TransactionSchedule.WEEK);
    });

    it.concurrent('should return two weeks payment frequency of repayment plan when response type is part admission', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.TWO_WEEKS);
      //When
      const result = getRepaymentFrequency(claim);
      //Then
      expect(result).toBe(TransactionSchedule.TWO_WEEKS);
    });

    it.concurrent('should return monthly payment frequency of repayment plan when response type is part admission', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.MONTH);
      //When
      const result = getRepaymentFrequency(claim);
      //Then
      expect(result).toBe(TransactionSchedule.MONTH);
    });
  });

  describe('getPaymentAmount', () => {
    it.concurrent('should return payment amount of repayment plan when response type is full admission on weekly schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.WEEK);
      //When
      const result = getPaymentAmount(claim);
      //Then
      expect(result).toBe(50);
    });

    it.concurrent('should return payment amount of repayment plan when response type is full admission on two weeks schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.TWO_WEEKS);
      //When
      const result = getPaymentAmount(claim);
      //Then
      expect(result).toBe(50);
    });

    it.concurrent('should return payment amount of repayment plan when response type is full admission on monthly schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.MONTH);
      //When
      const result = getPaymentAmount(claim);
      //Then
      expect(result).toBe(50);
    });

    it.concurrent('should return payment amount of repayment plan when response type is part admission on weekly schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.WEEK);
      //When
      const result = getPaymentAmount(claim);
      //Then
      expect(result).toBe(50);
    });

    it.concurrent('should return payment amount of repayment plan when response type is part admission two weeks schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.TWO_WEEKS);
      //When
      const result = getPaymentAmount(claim);
      //Then
      expect(result).toBe(50);
    });

    it.concurrent('should return payment amount of repayment plan when response type is part admission monthly schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.MONTH);
      //When
      const result = getPaymentAmount(claim);
      //Then
      expect(result).toBe(50);
    });
  });

  describe('getAmount', () => {
    it.concurrent('should return amount you owe when response type is part admission on weekly schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.WEEK);
      //When
      const result = getAmount(claim);
      //Then
      expect(result).toBe(200);
    });

    it.concurrent('should return amount you owe when response type is part admission on two weeks schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.TWO_WEEKS);
      //When
      const result = getAmount(claim);
      //Then
      expect(result).toBe(200);
    });

    it.concurrent('should return amount you owe when response type is part admission on monthly schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.MONTH);
      //When
      const result = getAmount(claim);
      //Then
      expect(result).toBe(200);
    });

    it.concurrent('should return total claim amount when response type is full admission on weekly schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.WEEK);
      //When
      const result = getAmount(claim);
      //Then
      expect(result).toBe(1000);
    });

    it.concurrent('should return total claim amount when response type is full admission on two weeks schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.TWO_WEEKS);
      //When
      const result = getAmount(claim);
      //Then
      expect(result).toBe(1000);
    });

    it.concurrent('should return total claim amount when response type is full admission on monthly schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.MONTH);
      //When
      const result = getAmount(claim);
      //Then
      expect(result).toBe(1000);
    });
  });

  describe('getRepaymentLength', () => {
    it.concurrent('should return repayment length when response type is part admission on weekly schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.WEEK, 100);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toBeUndefined();
    });
    it.concurrent('should return repayment length when response type is part admission on weekly schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.WEEK);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toContain('4');
    });
    it.concurrent('should return repayment length when response type is part admission on two weeks schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.TWO_WEEKS);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toContain('8');
    });
    it.concurrent('should return repayment length when response type is part admission on monthly schedule', () => {
      //Given
      const claim = getClaimForPA(TransactionSchedule.MONTH);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toContain('4');
    });
    it.concurrent('should return repayment length when response type is full admission on weekly schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.WEEK, 500);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toBeUndefined();
    });
    it.concurrent('should return repayment length when response type is full admission on weekly schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.WEEK);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toContain('20');
    });
    it.concurrent('should return repayment length when response type is full admission on two weeks schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.TWO_WEEKS);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toContain('40');
    });
    it.concurrent('should return repayment length when response type is full admission on monthly schedule', () => {
      //Given
      const claim = getClaimForFA(TransactionSchedule.MONTH);
      //When
      const repaymentLength = getRepaymentLength(claim, 'en');
      //Then
      expect(repaymentLength).toContain('20');
    });
  });
});
