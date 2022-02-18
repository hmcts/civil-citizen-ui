import {ValidationError} from 'class-validator';
import {CitizenTelephoneNumber} from '../../../../../main/common/form/models/citizenTelephoneNumber';

const ERROR_MESSAGE = 'Error message';
const PROPERTY = 'property';
describe('Citizen telephone number has errors', () => {
  const citizenTelephoneNumber = new CitizenTelephoneNumber();
  it('should return false when no errors exist', () => {
    //When
    const result = citizenTelephoneNumber.hasError();
    //Then
    expect(result).toBeFalsy();
  });

  it('should return true when errors exist', () => {
    //Given
    citizenTelephoneNumber.error = createValidationError();
    //When
    const result = citizenTelephoneNumber.hasError();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Citizen telephone number get error message', () => {
  const citizenTelephoneNumber = new CitizenTelephoneNumber();
  it('should return error message when there is an error', () => {
    //Given
    citizenTelephoneNumber.error = createValidationError();
    //When
    const result = citizenTelephoneNumber.getError();
    //Then
    expect(result.text).toBe(ERROR_MESSAGE);
  });
  it('should return undefined when there is no error', () => {
    //Given
    citizenTelephoneNumber.error = undefined;
    //When
    const result = citizenTelephoneNumber.getError();
    //Then
    expect(result).toBeUndefined();
  });
});

describe('Citizen telephone number constructor', () => {
  it('should trim telephone number value when given value has trailing spaces', () => {
    //Given
    const inputWithTrailingSpaces = ' 234234 ';
    //When
    const citizenTelephoneNumber = new CitizenTelephoneNumber(inputWithTrailingSpaces);
    //Then
    const expected = '234234';
    const result = citizenTelephoneNumber.telephoneNumber;
    expect(result).toBe(expected);
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return validationError;
}
