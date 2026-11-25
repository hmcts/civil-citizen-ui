import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';
import {GenericForm} from 'form/models/genericForm';

describe('ExpertDetails', () => {
  describe('email validation', () => {
    const validateEmail = (emailAddress?: string) => {
      const form = new GenericForm(new ExpertDetails('John', 'Doe', emailAddress, undefined, 'Needed', 'Surveying'));
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
      expect(validateEmail(emailAddress).errorFor('emailAddress')).toBe('ERRORS.ENTER_VALID_EMAIL');
    });
  });
});
