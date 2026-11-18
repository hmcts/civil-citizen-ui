import {GenericForm} from 'common/form/models/genericForm';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

describe('TimelineRow', () => {
  describe('constructor and buildPopulatedForm', () => {
    it('should build a date from day month year and set description', () => {
      const row = new TimelineRow(13, 8, 2024, 'Event happened');

      expect(row.day).toBe(13);
      expect(row.month).toBe(8);
      expect(row.year).toBe(2024);
      expect(row.description).toBe('Event happened');
      expect(row.date).toEqual(new Date(2024, 7, 13));
    });

    it('should build via buildPopulatedForm', () => {
      const row = TimelineRow.buildPopulatedForm(1, 2, 2023, 'Built');

      expect(row).toEqual(new TimelineRow(1, 2, 2023, 'Built'));
    });
  });

  describe('isEmpty and isAtLeastOneFieldPopulated', () => {
    it('should treat empty row as empty', () => {
      const row = new TimelineRow();

      expect(row.isEmpty()).toBe(true);
      expect(row.isAtLeastOneFieldPopulated()).toBe(false);
    });

    it('should treat populated description as not empty', () => {
      const row = new TimelineRow(undefined, undefined, undefined, 'Something');

      expect(row.isEmpty()).toBe(false);
      expect(row.isAtLeastOneFieldPopulated()).toBe(true);
    });

    it('should treat blank description-only empty strings as empty when date parts are undefined', () => {
      const row = new TimelineRow(undefined, undefined, undefined, '');

      expect(row.isEmpty()).toBe(true);
      expect(row.isAtLeastOneFieldPopulated()).toBe(false);
    });

    it('should not treat zero date parts as empty because a Date instance is created', () => {
      const row = new TimelineRow(0, 0, 0, '');

      expect(row.date).toBeInstanceOf(Date);
      expect(row.isEmpty()).toBe(false);
    });
  });

  describe('validation', () => {
    it('should not validate empty rows', async () => {
      const form = new GenericForm(new TimelineRow());

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should require date and description when partially populated', async () => {
      const form = new GenericForm(new TimelineRow(undefined, undefined, undefined, 'Only description'));

      await form.validate();

      expect(form.errorFor('date')).toBe('ERRORS.DATE_REQUIRED');
    });

    it('should pass for a valid past date and description', async () => {
      const form = new GenericForm(new TimelineRow(1, 1, 2020, 'Valid event'));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should reject future dates', async () => {
      const futureYear = new Date().getFullYear() + 2;
      const form = new GenericForm(new TimelineRow(1, 1, futureYear, 'Future event'));

      await form.validate();

      expect(form.errorFor('date')).toBe('ERRORS.CORRECT_DATE_NOT_IN_FUTURE');
    });
  });
});
