import {ValidationArguments} from 'class-validator';
import {RespondAddInfoValidator} from 'form/validators/respondAddInfoValidator';

describe('RespondAddInfoValidator', () => {
  const validator = new RespondAddInfoValidator();

  const buildArgs = (object: Record<string, unknown>, constraints: unknown[] = ['additionalText']): ValidationArguments => ({
    constraints,
    object,
    property: 'option',
    targetName: '',
    value: undefined,
  });

  describe('validate', () => {
    it('should return true when constraints are missing', () => {
      //Given
      const validationArguments = buildArgs({}, []);
      //When
      const result = validator.validate('yes', validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when value is undefined', () => {
      //Given
      const validationArguments = buildArgs({additionalText: 'info'});
      //When
      const result = validator.validate(undefined, validationArguments);
      //Then
      expect(result).toEqual(false);
      expect(validator.hasText).toEqual(true);
    });

    it('should return false when value is empty', () => {
      //Given
      const validationArguments = buildArgs({additionalText: null});
      //When
      const result = validator.validate('', validationArguments);
      //Then
      expect(result).toEqual(false);
      expect(validator.hasText).toEqual(false);
    });

    it('should return true when value is provided and additional text exists', () => {
      //Given
      const validationArguments = buildArgs({additionalText: 'some text'});
      //When
      const result = validator.validate('yes', validationArguments);
      //Then
      expect(result).toEqual(true);
      expect(validator.hasText).toEqual(true);
    });

    it('should return true when value is provided and additional text is missing', () => {
      //Given
      const validationArguments = buildArgs({additionalText: undefined});
      //When
      const result = validator.validate('yes', validationArguments);
      //Then
      expect(result).toEqual(true);
      expect(validator.hasText).toEqual(false);
    });

    it('should set hasText false when additional text is empty string', () => {
      //Given
      const validationArguments = buildArgs({additionalText: ''});
      //When
      const result = validator.validate('yes', validationArguments);
      //Then
      expect(result).toEqual(true);
      expect(validator.hasText).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return EMPTY_OPTION when hasText is false', () => {
      //Given
      validator.validate('yes', buildArgs({additionalText: ''}));
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.EMPTY_OPTION');
    });

    it('should return EMPTY_OPTION_TEXT when hasText is true', () => {
      //Given
      validator.validate(undefined, buildArgs({additionalText: 'text'}));
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.EMPTY_OPTION_TEXT');
    });
  });
});
