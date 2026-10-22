import {GenericForm} from 'common/form/models/genericForm';
import {EmailValidationWithMessage} from 'form/models/EmailValidationWithMessage';

describe('EmailValidationWithMessage', () => {
  describe('constructor', () => {
    it('should assign email and message name', () => {
      const model = new EmailValidationWithMessage('user@example.com', 'CUSTOM_EMAIL_ERROR');

      expect(model.emailAddress).toBe('user@example.com');
      expect(model.messageName).toBe('CUSTOM_EMAIL_ERROR');
    });

    it('should allow empty construction', () => {
      const model = new EmailValidationWithMessage();

      expect(model.emailAddress).toBeUndefined();
      expect(model.messageName).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should skip validation when email is empty', async () => {
      const form = new GenericForm(new EmailValidationWithMessage());

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should accept a valid email', async () => {
      const form = new GenericForm(new EmailValidationWithMessage('user@example.com'));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should use default error message for invalid email', async () => {
      const form = new GenericForm(new EmailValidationWithMessage('not-an-email'));

      await form.validate();

      expect(form.errorFor('emailAddress')).toBe('ERRORS.ENTER_VALID_EMAIL');
    });

    it('should use custom message name when provided', async () => {
      const form = new GenericForm(
        new EmailValidationWithMessage('not-an-email', 'ERRORS.CUSTOM_EMAIL'),
      );

      await form.validate();

      expect(form.errorFor('emailAddress')).toBe('ERRORS.CUSTOM_EMAIL');
    });
  });
});
