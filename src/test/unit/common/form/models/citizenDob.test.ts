import {Validator} from 'class-validator';
import {CitizenDob} from '../../../../../main/common/form/models/citizenDob';

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

