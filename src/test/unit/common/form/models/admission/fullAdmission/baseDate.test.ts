import {GenericForm} from 'common/form/models/genericForm';
import {BaseDate} from 'form/models/admission/fullAdmission/baseDate';

describe('BaseDate', () => {
  describe('constructor', () => {
    it('should convert string values to numbers', () => {
      const date = new BaseDate('2024', '08', '13');

      expect(date.year).toBe(2024);
      expect(date.month).toBe(8);
      expect(date.day).toBe(13);
    });

    it('should convert blank values to undefined', () => {
      const date = new BaseDate('', '', '');

      expect(date.year).toBeUndefined();
      expect(date.month).toBeUndefined();
      expect(date.day).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should pass for a valid date', async () => {
      const form = new GenericForm(new BaseDate('2024', '8', '13'));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should reject invalid day and month', async () => {
      const form = new GenericForm(new BaseDate('2024', '13', '32'));

      await form.validate();

      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
    });

    it('should reject year outside four digits', async () => {
      const form = new GenericForm(new BaseDate('999', '1', '1'));

      await form.validate();

      expect(form.errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should reject year above 9999', async () => {
      const form = new GenericForm(new BaseDate('10000', '1', '1'));

      await form.validate();

      expect(form.errorFor('year')).toBe('ERRORS.VALID_YEAR');
    });
  });
});
