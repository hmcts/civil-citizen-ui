import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNoCarmEmailConfirmation} from 'form/models/genericYesNoCarmEmailConfirmation';

describe('GenericYesNoCarmEmailConfirmation', () => {
  it('should assign option and message name', () => {
    const model = new GenericYesNoCarmEmailConfirmation('yes', 'CUSTOM');

    expect(model.option).toBe('yes');
    expect(model.messageName).toBe('CUSTOM');
  });

  it('should require option with default message', async () => {
    const form = new GenericForm(new GenericYesNoCarmEmailConfirmation());

    await form.validate();

    expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION_GALLAI_NA_ALLAI');
  });

  it('should use custom message when provided', async () => {
    const form = new GenericForm(new GenericYesNoCarmEmailConfirmation(undefined, 'CUSTOM_ERROR'));

    await form.validate();

    expect(form.errorFor('option')).toBe('CUSTOM_ERROR');
  });

  it('should pass when option is provided', async () => {
    const form = new GenericForm(new GenericYesNoCarmEmailConfirmation('no'));

    await form.validate();

    expect(form.hasErrors()).toBeFalsy();
  });
});
