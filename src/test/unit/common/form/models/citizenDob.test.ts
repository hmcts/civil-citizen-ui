import {ValidationError, Validator} from 'class-validator';
import {CitizenDob} from '../../../../../main/common/form/models/citizenDob';

describe('Citizen dob has errors', () => {
  const citizenDob = new CitizenDob();
  it('should return false when no errors exist', () => {
    //When
    const result = citizenDob.hasError();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true when errors exist', () => {
    //Given
    citizenDob.error = createValidationErrors();
    //When
    const result = citizenDob.hasError();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Citizen dob get error message', () => {
  const citizenDob = new CitizenDob();
  it('should return undefined when no errors exist', () => {
    //When
    const result = citizenDob.getErrorMessage();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return error message when errors exist', () => {
    //Given
    citizenDob.error = createValidationErrors();
    //When
    const result = citizenDob.getErrorMessage();
    //Then
    const expected = ['error'];
    expect(result).toEqual(expected);
  });
});

describe('Citizen dob field validation', () => {
  const validator = new Validator();
  it('should have errors when date of birth is not specified', ()=>{
    //Given
    const citizenDob = new CitizenDob();
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(4);
  });
  it('should have errors when date is not specified', ()=>{
    //Given
    const citizenDob = new CitizenDob('1999', '12');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(2);
  });
  it('should have errors when month is not specified', ()=>{
    //Given
    const citizenDob = new CitizenDob('1999', '', '1');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(2);
  });
  it('should have errors when year field is less than 1872', ()=> {
    //Given
    const citizenDob = new CitizenDob('1800', '12', '1');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(1);
  });
  it('should have errors when month is more than 12', ()=> {
    //Given
    const citizenDob = new CitizenDob('1999', '13', '1');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(2);
  });
  it('should have errors when month is less than 1', ()=> {
    //Given
    const citizenDob = new CitizenDob('1999', '0', '1');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(2);
  });
  it('should have errors when day is more than 31', ()=> {
    //Given
    const citizenDob = new CitizenDob('1999', '1', '33');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(2);
  });
  it('should have errors when day is less than 1', ()=> {
    //Given
    const citizenDob = new CitizenDob('1999', '1', '0');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(2);
  });
  it('should have errors when date is in the future', ()=> {
    //Given
    const citizenDob = new CitizenDob('2200', '12', '1');
    //When
    const result = validator.validateSync(citizenDob);
    //Then
    expect(result.length).toBe(1);
  });
});

function createValidationErrors() {
  const validationError = new ValidationError();
  validationError.property = 'dob';
  validationError.constraints = {'constraint': 'error'};
  return [validationError];
}
