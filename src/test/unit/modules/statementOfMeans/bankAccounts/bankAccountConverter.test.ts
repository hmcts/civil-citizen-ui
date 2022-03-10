import {convertFormToCitizenBankAccount, convertCitizenBankAccountsToForm} from '../../../../../main/modules/statementOfMeans/bankAccounts/bankAccountConverter';
import {BankAccounts} from '../../../../../main/common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../main/common/form/models/bankAndSavings/bankAccount';
import {CitizenBankAccount} from '../../../../../main/common/models/citizenBankAccount';

describe('Convert bank account entity to and from from', ()=> {
  it('should convert form to citizen bank account entity successfully when bank accounts exist', ()=> {
    //Given
    const input = new BankAccounts([new BankAccount('OTHER', 'true', '22'), new BankAccount('','','')]);
    //When
    const result = convertFormToCitizenBankAccount(input);
    //Then
    expect(result.length).toEqual(1);
    expect(result[0].typeOfAccount).toBe('OTHER');
  });
  it('should not convert form to citizen bank account entity successfully when bank accounts exist', ()=> {
    //Given
    const input = new BankAccounts([]);
    //When
    const result = convertFormToCitizenBankAccount(input);
    //Then
    expect(result).toBeUndefined();
  });
  it('should convert bank account entity to form', ()=>{
    //Given
    const input = [new CitizenBankAccount('OTHER', 'true', '22'), new CitizenBankAccount('OTHER', 'false', '33')];
    //When
    const result = convertCitizenBankAccountsToForm(input);
    //Then
    expect(result.accounts.length).toEqual(2);
    expect(result.accounts[0].typeOfAccount).toBe('OTHER');
    expect(result.accounts[0].joint).toBe('true');
    expect(result.accounts[0].balance).toBe('22');
    expect(result.accounts[1].joint).toBe('false');
    expect(result.accounts[1].balance).toBe('33');
  });
  it('should add extra account row in bank accounts form when only one citizen account entity exists', () => {
    //Given
    const input = [new CitizenBankAccount('OTHER', 'true', '22')];
    //When
    const result = convertCitizenBankAccountsToForm(input);
    //Then
    expect(result.accounts.length).toEqual(2);
  });
});
