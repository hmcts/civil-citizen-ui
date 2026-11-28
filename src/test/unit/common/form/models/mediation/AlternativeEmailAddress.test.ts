import {AlternativeEmailAddress} from 'form/models/mediation/AlternativeEmailAddress';
import {GenericForm} from 'form/models/genericForm';

describe('AlternativeEmailAddress', () => {
  describe('email validation', () => {
    const validateEmail = (alternativeEmailAddress?: string) => {
      const form = new GenericForm(new AlternativeEmailAddress(alternativeEmailAddress));
      form.validateSync();
      return form;
    };

    it.each([
      'plain@example.com',
      'user@example.technology',
    ])('should accept %s', (alternativeEmailAddress) => {
      expect(validateEmail(alternativeEmailAddress).hasErrors()).toBe(false);
    });

    it.each([
      'John Doe <john@example.com>',
      'aaa',
    ])('should reject %s', (alternativeEmailAddress) => {
      expect(validateEmail(alternativeEmailAddress).errorFor('alternativeEmailAddress')).toBe('ERRORS.ENTER_VALID_EMAIL_CARM');
    });

    it.each([
      ['empty', ''],
      ['missing', undefined],
    ])('should ask for an alternative email when it is %s', (_, alternativeEmailAddress) => {
      expect(validateEmail(alternativeEmailAddress).errorFor('alternativeEmailAddress')).toBe('ERRORS.ENTER_ALTERNATIVE_EMAIL_CARM');
    });
  });
});
