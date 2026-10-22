import {GenericForm} from 'common/form/models/genericForm';
import {BaseRepaymentPlanForm} from 'form/models/repaymentPlan/baseRepaymentPlan';

describe('BaseRepaymentPlanForm', () => {
  describe('constructor', () => {
    it('should convert string date parts and payment amount to numbers', () => {
      const form = new BaseRepaymentPlanForm(1000, 50, 'WEEK', '2026', '08', '13');

      expect(form.totalClaimAmount).toBe(1000);
      expect(form.paymentAmount).toBe(50);
      expect(form.repaymentFrequency).toBe('WEEK');
      expect(form.year).toBe(2026);
      expect(form.month).toBe(8);
      expect(form.day).toBe(13);
    });

    it('should leave numeric fields undefined when inputs are missing', () => {
      const form = new BaseRepaymentPlanForm();

      expect(form.paymentAmount).toBeUndefined();
      expect(form.year).toBeUndefined();
      expect(form.month).toBeUndefined();
      expect(form.day).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
    });
  });

  describe('string converters', () => {
    it('should convert defined values to strings', () => {
      const form = new BaseRepaymentPlanForm(500, 25.5, 'MONTH', '2025', '1', '2');

      expect(form.getPaymentAmountAsString()).toBe('25.5');
      expect(form.getYearAsString()).toBe('2025');
      expect(form.getMonthAsString()).toBe('1');
      expect(form.getDayAsString()).toBe('2');
    });

    it('should return empty string for undefined properties', () => {
      const form = new BaseRepaymentPlanForm();

      expect(form.convertToString(undefined)).toBe('');
      expect(form.getPaymentAmountAsString()).toBe('');
      expect(form.getYearAsString()).toBe('');
      expect(form.getMonthAsString()).toBe('');
      expect(form.getDayAsString()).toBe('');
    });
  });

  describe('validation', () => {
    it('should pass for a valid repayment plan', async () => {
      const model = new BaseRepaymentPlanForm(1000, 100, 'WEEK', '2030', '8', '15');
      const form = new GenericForm(model);

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should require payment amount and frequency', async () => {
      const form = new GenericForm(new BaseRepaymentPlanForm(1000));

      await form.validate();

      expect(form.errorFor('paymentAmount')).toBe('ERRORS.AMOUNT_REQUIRED');
      expect(form.errorFor('repaymentFrequency')).toBe('ERRORS.PAYMENT_FREQUENCY_REQUIRED');
      expect(form.errorFor('year')).toBe('ERRORS.VALID_YEAR');
    });

    it('should reject payment amount greater than total claim amount', async () => {
      const form = new GenericForm(new BaseRepaymentPlanForm(100, 150, 'WEEK', '2030', '8', '15'));

      await form.validate();

      expect(form.errorFor('paymentAmount')).toBe('ERRORS.EQUAL_INSTALMENTS_REQUIRED');
    });

    it('should reject invalid day and month ranges', async () => {
      const form = new GenericForm(new BaseRepaymentPlanForm(1000, 50, 'WEEK', '2026', '13', '32'));

      await form.validate();

      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
    });
  });
});
