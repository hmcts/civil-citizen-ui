import {GenericForm} from 'common/form/models/genericForm';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';

describe('CitizenDate', () => {
  beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12)); });
  afterEach(() => { jest.useRealTimers(); });

  describe('constructor', () => {
    it('should create a midnight date and numeric parts', () => {
      const citizenDate = new CitizenDate('15', '06', '1990');

      expect(citizenDate.day).toBe(15);
      expect(citizenDate.month).toBe(6);
      expect(citizenDate.year).toBe(1990);
      expect(citizenDate.date.getHours()).toBe(0);
      expect(citizenDate.date.getMinutes()).toBe(0);
      expect(citizenDate.date.getFullYear()).toBe(1990);
      expect(citizenDate.date.getMonth()).toBe(5);
      expect(citizenDate.date.getDate()).toBe(15);
    });

    it('should coerce missing values to NaN and Invalid Date', () => {
      const citizenDate = new CitizenDate();

      expect(Number.isNaN(citizenDate.day)).toBe(true);
      expect(Number.isNaN(citizenDate.month)).toBe(true);
      expect(Number.isNaN(citizenDate.year)).toBe(true);
      expect(Number.isNaN(citizenDate.date.getTime())).toBe(true);
    });
  });

  describe('validation', () => {
    it('should pass for a valid past date', async () => {
      const form = new GenericForm(new CitizenDate('01', '01', '2000'));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should reject invalid month and day', async () => {
      const form = new GenericForm(new CitizenDate('32', '13', '2000'));

      await form.validate();

      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
    });

    it('should reject future dates', async () => {
      const futureYear = new Date().getFullYear() + 2;
      const form = new GenericForm(new CitizenDate('01', '01', String(futureYear)));

      await form.validate();

      expect(form.errorFor('date')).toBe('ERRORS.CORRECT_DATE_NOT_IN_FUTURE');
    });

    it('should reject years older than 150 years', async () => {
      const tooOldYear = new Date().getFullYear() - 151;
      const form = new GenericForm(new CitizenDate('01', '01', String(tooOldYear)));

      await form.validate();

      expect(form.errorFor('year')).toBe('ERRORS.VALID_YEAR');
    });
  });
});
