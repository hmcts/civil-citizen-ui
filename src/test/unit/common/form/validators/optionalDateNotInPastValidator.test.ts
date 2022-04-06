import {
  OptionalDateNotInPastValidator
} from '../../../../../main/common/form/validators/optionalDateNotInPastValidator';

describe('OptionalDateNotInPastValidator validate', () => {
  const validator = new OptionalDateNotInPastValidator();
  it('should return false when date is in the past', () => {
    //Given
    const date = new Date(2010, 1, 1);
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true when date is today', () => {
    //Given
    const date = new Date(Date.now());
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeTruthy();
  });
  it('should return true when date is not in the past', () => {
    //Given
    const date = new Date(2400, 1, 1);
    //When
    const result = validator.validate(date);
    //Then
    expect(result).toBeTruthy();
  });
});
