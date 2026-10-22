import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNoCarmContactPersonConfirmation} from 'form/models/genericYesNoCarmContactPersonConfirmation';

describe('GenericYesNoCarmContactPersonConfirmation', () => {
  it('should assign option and message name', () => {
    const model = new GenericYesNoCarmContactPersonConfirmation('yes', 'CUSTOM');

    expect(model.option).toBe('yes');
    expect(model.messageName).toBe('CUSTOM');
  });

  it('should require option with default message', async () => {
    const form = new GenericForm(new GenericYesNoCarmContactPersonConfirmation());

    await form.validate();

    expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION_CARM_IE_NEU_NA');
  });

  it('should use custom message when provided', async () => {
    const form = new GenericForm(
      new GenericYesNoCarmContactPersonConfirmation(undefined, 'CUSTOM_ERROR'),
    );

    await form.validate();

    expect(form.errorFor('option')).toBe('CUSTOM_ERROR');
  });

  it('should pass when option is provided', async () => {
    const form = new GenericForm(new GenericYesNoCarmContactPersonConfirmation('no'));

    await form.validate();

    expect(form.hasErrors()).toBeFalsy();
  });
});
