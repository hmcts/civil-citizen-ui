import {ValidationArguments} from 'class-validator';
import {IsNotEmptyForParty} from 'form/validators/mandatoryValidatorForParty';

describe('IsNotEmptyForParty', () => {
  const validator = new IsNotEmptyForParty();

  const buildArgs = (object: Record<string, unknown>, constraints: unknown[] = ['mandatoryForParty']): ValidationArguments => ({
    constraints,
    object,
    property: 'telephoneNumber',
    targetName: '',
    value: undefined,
  });

  describe('validate', () => {
    it('should return true when mandatoryForParty is false', () => {
      //Given
      const validationArguments = buildArgs({mandatoryForParty: false});
      //When
      const result = validator.validate('', validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when mandatoryForParty is undefined', () => {
      //Given
      const validationArguments = buildArgs({});
      //When
      const result = validator.validate(null, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when mandatory and value is null', () => {
      //Given
      const validationArguments = buildArgs({mandatoryForParty: true});
      //When
      const result = validator.validate(null, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false when mandatory and value is undefined', () => {
      //Given
      const validationArguments = buildArgs({mandatoryForParty: true});
      //When
      const result = validator.validate(undefined, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false when mandatory and value is empty string', () => {
      //Given
      const validationArguments = buildArgs({mandatoryForParty: true});
      //When
      const result = validator.validate('', validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when mandatory and value is provided', () => {
      //Given
      const validationArguments = buildArgs({mandatoryForParty: true});
      //When
      const result = validator.validate('07911123456', validationArguments);
      //Then
      expect(result).toEqual(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {
      //Given
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.ENTER_TELEPHONE_NUMBER');
    });
  });
});
