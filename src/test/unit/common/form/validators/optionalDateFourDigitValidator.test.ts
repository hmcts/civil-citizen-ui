import {
  OptionalDateFourDigitValidator,
} from '../../../../../main/common/form/validators/optionalDateFourDigitValidator';

describe('OptionalDateFourDigitValidator validate', () => {
  const validator = new OptionalDateFourDigitValidator();
  it('should return true when date year has at least 4 digits ', () => {
    //Given
    const year = 2040;
    //When
    const result = validator.validate(year);
    //Then
    expect(result).toBeTruthy();
  });
  it('should return false when date is less than 4 digits', () => {
    //Given
    const year = 30;
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
