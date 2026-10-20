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

  it.each([
    ['Accented characters', 'Café & Résumé'],
    ['Unallowed symbols (<, >)', 'Hello <world>!'],
    ['Emojis', 'Great work! 👍'],
    ['Brackets & Braces', 'User { id: 101, flags: [a, b] }'],
  ])(
    'should reject breathing space lift reason when it contains %s (%s)',
    (description, invalidInput) => {
      const form = new LiftBreathingSpaceForm(
        '2024',
        '06',
        '01',
        invalidInput,
        new Date('2024-06-01T00:00:00'),
        STANDARD_BREATHING_SPACE);
      const genericForm = new GenericForm(form);

      genericForm.validateSync();

      expect(genericForm.getErrors().some(e => e.property === 'text')).toBe(true);
    });

  it('should accept breathing space lift reason when it contains only allowed characters', () => {
    const startDate = new Date('2024-06-01T00:00:00');
    const validInput = "Hello! Here's a test string (£50) with \"smart quotes” – and multi-line text:\n\tr1 @company #1";
    const form = new LiftBreathingSpaceForm('2024', '06', '01', validInput, startDate, STANDARD_BREATHING_SPACE);
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
