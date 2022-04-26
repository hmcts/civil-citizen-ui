import {
  OptionalDateNotInFutureValidator
} from '../../../../../main/common/form/validators/optionalDateNotInFutureValidator';

describe('OptionalDateNotInFutureValidator validate', () => {
  const validator = new OptionalDateNotInFutureValidator();
  it('should return true when date is not in the future', () => {
    //Given
    const date = new Date(2010, 1, 1);
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeTruthy();
  });
  it('should return false when date is in the future', () => {
    //Given
    const date = new Date(2400, 1, 1);
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return specific text for defaultMessage', () => {
    //Given
    const defaultMessage = 'Please enter a valid date';
    //When
    const result = validator.defaultMessage();
    //Then
    expect(result).toEqual(defaultMessage);
  });
});
