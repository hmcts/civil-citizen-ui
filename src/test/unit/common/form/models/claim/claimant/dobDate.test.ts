import {GenericForm} from 'common/form/models/genericForm';
import {DOBDate} from 'form/models/claim/claimant/dobDate';
import {getDOBforAgeFromCurrentTime} from 'common/utils/dateUtils';

describe('DOBDate', () => {
  beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12)); });
  afterEach(() => { jest.useRealTimers(); });

  describe('constructor', () => {
    it('should create a date of birth from parts', () => {
      const dob = new DOBDate('01', '02', '1990');

      expect(dob.day).toBe(1);
      expect(dob.month).toBe(2);
      expect(dob.year).toBe(1990);
      expect(dob.date.getFullYear()).toBe(1990);
      expect(dob.date.getMonth()).toBe(1);
      expect(dob.date.getDate()).toBe(1);
      expect(dob.date.getHours()).toBe(0);
    });

    it('should reset fields to undefined when all args are undefined', () => {
      const dob = new DOBDate();

      expect(dob.day).toBeUndefined();
      expect(dob.month).toBeUndefined();
      expect(dob.year).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should pass for an adult date of birth', async () => {
      const adultCutoff = getDOBforAgeFromCurrentTime(18);
      const year = adultCutoff.getFullYear() - 1;
      const form = new GenericForm(new DOBDate('01', '01', String(year)));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should reject under-18 date of birth', async () => {
      const under18Cutoff = getDOBforAgeFromCurrentTime(18);
      const year = under18Cutoff.getFullYear() + 1;
      const form = new GenericForm(new DOBDate('01', '01', String(year)));

      await form.validate();

      expect(form.errorFor('date')).toBe('ERRORS.VALID_ENTER_A_DATE_BEFORE');
    });

    it('should reject invalid day and month', async () => {
      const form = new GenericForm(new DOBDate('32', '13', '1990'));

      await form.validate();

      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
    });
  });
});
