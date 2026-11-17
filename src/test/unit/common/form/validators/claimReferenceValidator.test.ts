import {ClaimReferenceValidator} from 'form/validators/claimReferenceValidator';

describe('ClaimReferenceValidator', () => {
  const validator = new ClaimReferenceValidator();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toEqual(false);
    });

    it('should return true for valid claim reference', () => {
      //Given
      //When
      const result = validator.validate('123AB456');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for lowercase claim reference', () => {
      //Given
      //When
      const result = validator.validate('123ab456');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for invalid format', () => {
      //Given
      //When
      const result = validator.validate('12345678');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for too short reference', () => {
      //Given
      //When
      const result = validator.validate('12AB45');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for reference with special characters', () => {
      //Given
      //When
      const result = validator.validate('123AB45!');
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return CLAIM_NUMBER_REQUIRED when value is falsy', () => {
      //Given
      validator.validate('');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.CLAIM_NUMBER_REQUIRED');
    });

    it('should return VALID_CLAIM_REFERENCE_NUMBER when value is truthy but invalid', () => {
      //Given
      validator.validate('invalid');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_CLAIM_REFERENCE_NUMBER');
    });
  });
});
