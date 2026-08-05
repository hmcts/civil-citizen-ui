import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {
  LiftBreathingSpaceForm,
  STANDARD_BREATHING_SPACE,
} from '../../../../../../main/common/form/models/breathingSpace/liftBreathingSpaceForm';

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

  it('should accept standard breathing space end date exactly 60 days after start', () => {
    const startDate = new Date('2024-06-01T00:00:00');
    const form = new LiftBreathingSpaceForm('2024', '07', '31', 'Reason', startDate, STANDARD_BREATHING_SPACE);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();
    expect(genericForm.getErrors().some(e => e.property === 'date')).toBe(false);
  });
});
