import {ValidationArguments} from 'class-validator';
import {FullNameValidator} from 'form/validators/fullNameValidator';

const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = 'This is a 35 char address aAbBcCdDe';

describe('FullNameValidator', () => {
  const validator = new FullNameValidator();
  describe('judgment online validation', () => {
    it('should return true for a 35 char title', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'title', targetName: '', value: ''};
      //When
      const result1 = await validator.validate(string35charLong, validationArguments);
      //Then
      expect(result1).toEqual(true);
    });
    it('should return true for a 70 char full name', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 70}
        , property: '', targetName: '', value: 'text'};
      //When
      const result = await validator.validate(' ', validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for a 36 char title', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'title', targetName: '', value: ''};
      //When
      const result1 = await validator.validate(string36charLong, validationArguments);
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ENTER_VALID_TITLE');
    });
    it('should return false for a 71 char full name', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 71}
        , property: 'firstName', targetName: '', value: 'text'};
      //When
      const result1 = await validator.validate(' ', validationArguments);
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TEXT_TOO_MANY');
    });
  });
});
