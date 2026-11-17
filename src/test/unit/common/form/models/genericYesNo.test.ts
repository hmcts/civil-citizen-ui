import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';

describe('GenericYesNo', () => {
  it('should assign option and message name', () => {
    const model = new GenericYesNo('yes', 'CUSTOM');

    expect(model.option).toBe('yes');
    expect(model.messageName).toBe('CUSTOM');
  });

  it('should require option with default message', async () => {
    const form = new GenericForm(new GenericYesNo());

    await form.validate();

    expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
  });

  it('should use custom message when provided', async () => {
    const form = new GenericForm(new GenericYesNo(undefined, 'CUSTOM_ERROR'));

    await form.validate();

    expect(form.errorFor('option')).toBe('CUSTOM_ERROR');
  });

  it('should pass when option is provided', async () => {
    const form = new GenericForm(new GenericYesNo('no'));

    await form.validate();

    expect(form.hasErrors()).toBeFalsy();
  });
});
