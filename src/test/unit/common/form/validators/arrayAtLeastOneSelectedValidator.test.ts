import {ArrayAtLeastOneSelectedValidator} from '../../../../../main/common/form/validators/arrayAtLeastOneSelectedValidator';
import {BankAccount} from '../../../../../main/common/form/models/bankAndSavings/bankAccount';
import {BankAccountTypes} from '../../../../../main/common/form/models/bankAndSavings/bankAccountTypes';

describe('ArrayAtLeastOneSelectedValidator validate', ()=>{
  const validator = new ArrayAtLeastOneSelectedValidator();
  it('should return false when all values of array elements are empty', () =>{
    //Given
    const input =[new BankAccount(), new BankAccount()];
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true when one element of array is not empty', ()=>{
    //Given
    const input =[new BankAccount(new BankAccountTypes().CURRENT_ACCOUNT, true, '-345'),new BankAccount()];
    //When
    const result = validator.validate(input);
    //Then
    expect(result).toBeTruthy();
  });
});
