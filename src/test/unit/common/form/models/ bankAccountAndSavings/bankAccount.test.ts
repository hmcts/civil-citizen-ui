import {BankAccount} from '../../../../../../main/common/form/models/bankAndSavings/bankAccount';
import {Validator} from 'class-validator';
import {BankAccountTypeValues} from '../../../../../../main/common/form/models/bankAndSavings/bankAccountTypeValues';
describe('BankAccount is at least one field populated', ()=> {
  it('should return true when one field is populated', () => {
    //Given
    const account = new BankAccount(undefined, true, undefined);
    //When
    const result = account.isAtLeastOneFieldPopulated();
    //Then
    expect(result).toBeTruthy();
  });
  it('should return false when no fields are populated', () =>{
    //Given
    const account = new BankAccount();
    //When
    const result = account.isAtLeastOneFieldPopulated();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('BankAccount validation', () => {
  const validator = new Validator();
  it('should not allow empty values when one field is populated', () =>{
    //Given
    const account = new BankAccount(undefined, true, undefined);
    //When
    const result = validator.validateSync(account);
    //Then
    expect(result.length).toBe(2);
  });
  it('should not allow empty value when two fieldw is populated', () =>{
    //Given
    const account = new BankAccount(undefined, true, undefined);
    //When
    const result = validator.validateSync(account);
    //Then
    expect(result.length).toBe(2);
  });
  it('should have no errors when all fields are populated', () =>{
    //Given
    const account = new BankAccount(BankAccountTypeValues.CURRENT_ACCOUNT, true, '200');
    //When
    const result = validator.validateSync(account);
    //Then
    expect(result.length).toBe(0);
  });
  it('should have no errors when no fields are populated', () =>{
    //Given
    const account = new BankAccount(undefined, undefined, '');
    //When
    const result = validator.validateSync(account);
    //Then
    expect(result.length).toBe(0);
  });
  it('should have an erro when account type is a wrong value', () =>{
    //Given
    const account = new BankAccount('CHOOSE', true, '200');
    //When
    const result = validator.validateSync(account);
    //Then
    expect(result.length).toBe(1);
  });
});
