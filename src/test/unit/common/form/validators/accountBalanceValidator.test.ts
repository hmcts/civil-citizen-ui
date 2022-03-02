import {AccountBalanceValidator} from '../../../../../main/common/form/validators/accountBalanceValidator';
describe('Account Balance Validator validate', () => {
  const validator = new AccountBalanceValidator();
  it('should allow negative value', ()=> {
    //Given
    const input = '-1';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeTruthy();
  });
  it('should allow negative value with one decimal', ()=> {
    //Given
    const input = '-1.1';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeTruthy();
  });
  it('should allow negative value with two decimal places', ()=> {
    //Given
    const input = '-1.11';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeTruthy();
  });
  it('should not allow negative value with more than two decimal places', ()=> {
    //Given
    const input = '-1.111';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeFalsy();
  });
  it('should allow positive value with one decimal', ()=> {
    //Given
    const input = '1.1';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeTruthy();
  });

  it('should allow whole number', ()=> {
    //Given
    const input = '89674';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeTruthy();
  });
  it('should allow two decimal places', ()=> {
    //Given
    const input = '89674.22';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeTruthy();
  });
  it('should not allow postive number with more than two decimal places', ()=> {
    //Given
    const input = '89674.22222';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeFalsy();
  });
  it('should not allow non numeric values',() =>{
    //Given
    const input = 'abra abra cadabra';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeFalsy();
  });
  it('should not allow special characters',() =>{
    //Given
    const input = '(09454)745684';
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeFalsy();
  });
});
