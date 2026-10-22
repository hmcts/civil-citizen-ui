import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNoKnownClaimAmount} from 'form/models/genericYesNoKnownClaimAmount';

describe('GenericYesNoKnownClaimAmount', () => {
  it('should assign option and message name', () => {
    const model = new GenericYesNoKnownClaimAmount('yes', 'CUSTOM');

    expect(model.option).toBe('yes');
    expect(model.messageName).toBe('CUSTOM');
  });

  it('should require option with default message', async () => {
    const form = new GenericForm(new GenericYesNoKnownClaimAmount());

    await form.validate();

    expect(form.errorFor('option')).toBe('ERRORS.KNOWN_CLAIM_AMOUNT');
  });

  it('should use custom message when provided', async () => {
    const form = new GenericForm(new GenericYesNoKnownClaimAmount(undefined, 'CUSTOM_ERROR'));

    await form.validate();

    expect(form.errorFor('option')).toBe('CUSTOM_ERROR');
  });

  it('should pass when option is provided', async () => {
    const form = new GenericForm(new GenericYesNoKnownClaimAmount('no'));

    await form.validate();

    expect(form.hasErrors()).toBeFalsy();
  });
});
