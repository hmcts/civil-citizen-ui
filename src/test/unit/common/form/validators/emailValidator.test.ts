import {EmailValidator} from 'form/validators/emailValidator';

describe('EmailValidator', () => {
  const validator = new EmailValidator();

  describe('validate', () => {
    it('should return true for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toBe(true);
    });

    it('should return true for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toBe(true);
    });

    it.each([
      'plain@example.com',
      'first.last@example.co.uk',
      'user+tag@example.org',
      'user@example.technology',
      'user@example.solicitors',
    ])('should accept %s', (email) => {
      //Given
      //When
      const result = validator.validate(email);
      //Then
      expect(result).toBe(true);
    });

    it.each([
      'John Doe <john@example.com>',
      '<john@example.com>',
      'aaa',
      'a@b',
      'john@example',
      'john@@example.com',
      'john @example.com',
      'john@example.c',
      'john@exam_ple.com',
    ])('should reject %s', (email) => {
      //Given
      //When
      const result = validator.validate(email);
      //Then
      expect(result).toBe(false);
    });

    it('should reject an email longer than 320 characters', () => {
      //Given
      const email = `${'a'.repeat(64)}@${'b'.repeat(255)}.com`;
      //When
      const result = validator.validate(email);
      //Then
      expect(email.length).toBeGreaterThan(320);
      expect(result).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the generic valid email message', () => {
      //Given
      //When
      const result = validator.defaultMessage();
      //Then
      expect(result).toBe('ERRORS.ENTER_VALID_EMAIL');
    });
  });
});
