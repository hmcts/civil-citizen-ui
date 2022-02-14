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

  it('should return true when errors exist', ()=> {
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
  it('should return error message when there is an error', ()=> {
    //Given
    citizenTelephoneNumber.error = createValidationError();
    //When
    const result = citizenTelephoneNumber.getErrorMessage();
    //Then
    expect(result).toBe(ERROR_MESSAGE);
  });
  it('should return undefined when there is no error', () => {
    //When
    const result = citizenTelephoneNumber.getErrorMessage();
    //Then
    expect(result).toBeUndefined();
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return validationError;
}
