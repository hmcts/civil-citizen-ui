import {GenericForm} from 'common/form/models/genericForm';
import {PhoneValidationWithMessage} from 'form/models/PhoneValidationWithMessage';

describe('PhoneValidationWithMessage', () => {
  describe('constructor', () => {
    it('should assign telephone and message name', () => {
      const model = new PhoneValidationWithMessage('07700900000', 'CUSTOM_PHONE_ERROR');

      expect(model.alternativeTelephone).toBe('07700900000');
      expect(model.messageName).toBe('CUSTOM_PHONE_ERROR');
    });

    it('should allow empty construction', () => {
      const model = new PhoneValidationWithMessage();

      expect(model.alternativeTelephone).toBeUndefined();
      expect(model.messageName).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should skip validation when telephone is empty', async () => {
      const form = new GenericForm(new PhoneValidationWithMessage());

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should accept a valid UK phone number', async () => {
      const form = new GenericForm(new PhoneValidationWithMessage('07700900000'));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should use default error message for invalid phone', async () => {
      const form = new GenericForm(new PhoneValidationWithMessage('not-a-phone'));

      await form.validate();

      expect(form.errorFor('alternativeTelephone')).toBe('ERRORS.VALID_PHONE_NUMBER');
    });

    it('should use custom message name when provided', async () => {
      const form = new GenericForm(
        new PhoneValidationWithMessage('not-a-phone', 'ERRORS.CUSTOM_PHONE'),
      );

      await form.validate();

      expect(form.errorFor('alternativeTelephone')).toBe('ERRORS.CUSTOM_PHONE');
    });
  });
});
