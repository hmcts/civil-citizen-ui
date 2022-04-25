import {OptionalDateInPastValidator} from '../../../../../main/common/form/validators/optionalDateInPastValidator';

describe('OptionalDateInPastValidator validate', () => {
  const validator = new OptionalDateInPastValidator();
  it('should return true when date is in the past', () => {
    //Given
    const date = new Date(2010, 1, 1);
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeTruthy();
  });
  it('should return false when date is today', () => {
    //Given
    const date = new Date(Date.now());
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false when date is in the future', () => {
    //Given
    const date = new Date(9999, 12, 31);
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return specific text for defaultMessage', () => {
    //Given
    const defaultMessage = 'Enter date before ';
    //When
    const result = validator.defaultMessage();
    //Then
    expect(result).toEqual(defaultMessage);
  });
});
