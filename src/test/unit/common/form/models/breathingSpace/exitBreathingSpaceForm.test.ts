import {ExitBreathingSpaceForm} from 'common/form/models/breathingSpace/exitBreathingSpaceForm';
import {BreathingSpaceType} from 'common/models/breathingSpace/breathingSpace';
import {GenericForm} from 'common/form/models/genericForm';

describe('ExitBreathingSpaceForm', () => {
  it('should create form with correct values', () => {
    const startDate = new Date(2023, 0, 1);
    const form = new ExitBreathingSpaceForm('10', '1', '2023', 'Reason', startDate, BreathingSpaceType.STANDARD);
    expect(form.date).toEqual(new Date(2023, 0, 10));
    expect(form.day).toBe(10);
    expect(form.month).toBe(1);
    expect(form.year).toBe(2023);
    expect(form.reason).toBe('Reason');
    expect(form.breathingSpaceStartDate).toEqual(startDate);
    expect(form.breathingSpaceType).toBe(BreathingSpaceType.STANDARD);
  });

  it('should have validation errors for invalid date', async () => {
    const startDate = new Date(2023, 0, 10);
    const form = new ExitBreathingSpaceForm('5', '1', '2023', 'Reason', startDate, BreathingSpaceType.STANDARD);
    const genericForm = new GenericForm(form);
    await genericForm.validate();
    expect(genericForm.hasErrors()).toBeTruthy();
    expect(genericForm.errorFor('date')).toBe('ERRORS.BREATHING_SPACE_EXIT_DATE_AFTER_START');
  });

  it('should have validation errors for date > 60 days for Standard BS', async () => {
    const startDate = new Date(2023, 0, 1);
    const form = new ExitBreathingSpaceForm('5', '3', '2023', 'Reason', startDate, BreathingSpaceType.STANDARD);
    const genericForm = new GenericForm(form);
    await genericForm.validate();
    expect(genericForm.hasErrors()).toBeTruthy();
    expect(genericForm.errorFor('date')).toBe('ERRORS.BREATHING_SPACE_EXIT_DATE_NOT_MORE_THAN_60_DAYS');
  });

  it('should not have validation errors for date > 60 days for Mental Health BS', async () => {
    const startDate = new Date(2023, 0, 1);
    const form = new ExitBreathingSpaceForm('5', '5', '2023', 'Reason', startDate, BreathingSpaceType.MENTAL_HEALTH);
    const genericForm = new GenericForm(form);
    await genericForm.validate();
    expect(genericForm.hasErrors()).toBeFalsy();
  });

  it('should have validation error for too long reason', async () => {
    const reason = 'a'.repeat(1001);
    const form = new ExitBreathingSpaceForm('10', '1', '2023', reason);
    const genericForm = new GenericForm(form);
    await genericForm.validate();
    expect(genericForm.hasErrors()).toBeTruthy();
    expect(genericForm.errorFor('reason')).toBe('ERRORS.TEXT_TOO_LONG');
  });
});
