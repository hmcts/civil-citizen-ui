import {BankAccounts} from '../../../../../../main/common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../../main/common/form/models/bankAndSavings/bankAccount';
import {Validator} from 'class-validator';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';

describe('Bank accounts validation', ()=>{
  const validator = new Validator();

  it('should not allow empty value when one field is populated', async () =>{
    //Given
    const account = new BankAccount(undefined, 'true', undefined);
    const accounts = new BankAccounts([account, new BankAccount('', '', '')]);
    //When
    const result = await validator.validate(accounts);
    //Then
    expect(result.length).toBe(1);
    expect(result[0].children?.length).toBe(1);
  });

  it('should not allow empty value when two fields are populated', async () =>{
    //Given
    const account = new BankAccount(undefined, 'true', '345');
    const accounts = new BankAccounts([account, new BankAccount('', '', '')]);
    //When
    const result = await validator.validate(accounts);
    //Then
    expect(result.length).toBe(1);
    expect(result[0].children?.length).toBe(1);
  });

  it('should not have errors when all fields are populated', async () =>{
    //Given
    const account = new BankAccount('OTHER', 'true', '345');
    const accounts = new BankAccounts([account, new BankAccount('','','')]);
    //When
    const result = await validator.validate(accounts);
    //Then
    expect(result.length).toBe(0);
  });

  it('should return true for has errors when there is a validation error in accounts array element', async ()=>{
    //Given
    const account = new BankAccount(undefined, 'true', undefined);
    const accounts = new GenericForm(new BankAccounts([account, new BankAccount('', '', '')]));
    //When
    const result = await validator.validate(accounts);
    accounts.errors = result;
    //Then
    expect(accounts.hasErrors()).toBeTruthy();
  });

  it('should filter out all empty accounts', ()=>{
    //Given
    const account = new BankAccount('OTHER', 'true', '345');
    const accounts = new BankAccounts([account, new BankAccount('', '', '')]);
    //When
    const result = accounts.getOnlyCompletedAccounts();
    //Then
    expect(result.length).toEqual(1);
    expect(result[0].joint).toBeTruthy();
  });
});
