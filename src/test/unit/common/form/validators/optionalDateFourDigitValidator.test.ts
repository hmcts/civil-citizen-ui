import {
  OptionalDateFourDigitValidator,
} from '../../../../../main/common/form/validators/optionalDateFourDigitValidator';

describe('OptionalDateNotInFutureValidator validate', () => {
  const validator = new OptionalDateFourDigitValidator();
  it('should return true when a 4 digit year', () => {
    //Given
    const year = 2020;
    //When
    const result = validator.validate(year);
    //Then
    expect(result).toBeTruthy();
  });
  it('should return false when negative number', () => {
    //Given
    const year = -1;
    //When
    const result = validator.validate(year);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false when a 3 digit year', () => {
    //Given
    const year = 201;
    //When
    const result = validator.validate(year);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false when a 2 digit year', () => {
    //Given
    const year = 20;
    //When
    const result = validator.validate(year);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false when a 1 digit year', () => {
    //Given
    const year = 2;
    //When
    const result = validator.validate(year);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return specific text for defaultMessage', () => {
    //Given
    const defaultMessage = 'Enter a 4 digit year';
    //When
    const result = validator.defaultMessage();
    //Then
    expect(result).toEqual(defaultMessage);
  });
});
