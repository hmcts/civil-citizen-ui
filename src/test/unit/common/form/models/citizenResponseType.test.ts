import {Validator} from 'class-validator';
import {CitizenResponseType} from '../../../../../main/common/form/models/citizenResponseType';

describe('Citizen Response Type Validation', () => {
  const validator = new Validator();
  it('should has error when the Response type is empty', ()=>{
    //Given
    const citizenResponseType = new CitizenResponseType();
    //When
    const result = validator.validateSync(citizenResponseType);
    //Then
    expect(result.length).toBe(1);
  });
});
describe('Citizen Response Type Validation', () => {
  const validator = new Validator();
  it('should has no error when the Response type has value', ()=>{
    //Given
    const citizenResponseType = new CitizenResponseType('test');
    //When
    const result = validator.validateSync(citizenResponseType);
    //Then
    expect(result.length).toBe(0);
  });
});
