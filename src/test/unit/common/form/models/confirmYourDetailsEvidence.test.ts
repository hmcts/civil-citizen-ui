import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';
import {GenericForm} from 'form/models/genericForm';

describe('ConfirmYourDetailsEvidence', () => {
  describe('email validation', () => {
    const validateEmail = (emailAddress?: string) => {
      const form = new GenericForm(new ConfirmYourDetailsEvidence('John', 'Doe', emailAddress, undefined, 'Manager'));
      form.validateSync();
      return form;
    };

    it.each([
      'plain@example.com',
      'user@example.technology',
    ])('should accept %s', (emailAddress) => {
      expect(validateEmail(emailAddress).errorFor('emailAddress')).toBeUndefined();
    });

    it('should not validate email when it is not provided', () => {
      expect(validateEmail(undefined).errorFor('emailAddress')).toBeUndefined();
    });

    it.each([
      'John Doe <john@example.com>',
      'aaa',
    ])('should reject %s', (emailAddress) => {
      expect(validateEmail(emailAddress).errorFor('emailAddress')).toBe('ERRORS.ENTER_VALID_EMAIL_EVIDENCE');
    });
  });
});
