import {GenericForm} from 'form/models/genericForm';
import {
  LiftBreathingSpaceForm,
  STANDARD_BREATHING_SPACE,
} from 'form/models/breathingSpace/liftBreathingSpaceForm';

describe('LiftBreathingSpaceForm', () => {
  it('should reject end date on or before start date', () => {
    const startDate = new Date('2024-06-01T00:00:00');
    const form = new LiftBreathingSpaceForm('2024', '06', '01', 'Reason', startDate, STANDARD_BREATHING_SPACE);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();
    expect(genericForm.getErrors().some(e => e.property === 'date')).toBe(true);
  });

  it('should reject standard breathing space end date more than 60 days after start', () => {
    const startDate = new Date('2024-06-01T00:00:00');
    const form = new LiftBreathingSpaceForm('2024', '08', '02', 'Reason', startDate, STANDARD_BREATHING_SPACE);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();
    expect(genericForm.getErrors().some(e => e.property === 'date')).toBe(true);
  });

  it('should reject breathing space lift reason more than 1000 characters', () => {
    const startDate = new Date('2024-06-01T00:00:00');
    const form = new LiftBreathingSpaceForm('2024', '06', '01', 'a'.repeat(1001), startDate, STANDARD_BREATHING_SPACE);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();
    expect(genericForm.getErrors().some(e => e.property === 'text')).toBe(true);
  });

  it('should accept breathing space lift reason exactly 1000 characters', () => {
    const startDate = new Date('2024-06-01T00:00:00');
    const form = new LiftBreathingSpaceForm('2024', '06', '01', 'a'.repeat(1000), startDate, STANDARD_BREATHING_SPACE);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();
    expect(genericForm.getErrors().some(e => e.property === 'text')).toBe(false);
  });

  it('should accept standard breathing space end date exactly 60 days after start', () => {
    const startDate = new Date('2024-06-01T00:00:00');
    const form = new LiftBreathingSpaceForm('2024', '07', '31', 'Reason', startDate, STANDARD_BREATHING_SPACE);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();
    expect(genericForm.getErrors().some(e => e.property === 'date')).toBe(false);
  });

  it('should leave an empty non-standard breathing space end date blank', () => {
    const form = new LiftBreathingSpaceForm(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'MENTAL_HEALTH',
    );
    expect(form.date).toBeUndefined();
    expect(form.day).toBeUndefined();
    expect(form.month).toBeUndefined();
    expect(form.year).toBeUndefined();
  });
});
