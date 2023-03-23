import {toCUIBankAccount} from 'services/translation/convertToCUI/convertToCUIBankAccount';
import {CCDBankAccount, CCDBankAccountType} from 'models/ccdResponse/ccdBankAccount';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CitizenBankAccount} from 'models/citizenBankAccount';
import {BankAccountTypeValues} from 'form/models/bankAndSavings/bankAccountTypeValues';

describe('translate Bank Account to CUI model', () => {
  it('should return undefined if Bank Account doesnt exist', () => {
    //Given
    //When
    const output = toCUIBankAccount(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if Bank Account empty', () => {
    //Given
    const input : CCDBankAccount[] = [];
    //When
    const output = toCUIBankAccount(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if Bank Account empty', () => {
    //Given
    const input : CCDBankAccount[] = [];
    //When
    const output = toCUIBankAccount(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if there is Bank Account', () => {
    //Given
    const input : CCDBankAccount[] = [
      {
        id: '1',
        value: {
          accountType: CCDBankAccountType.CURRENT,
          jointAccount: YesNoUpperCamelCase.YES,
          balance: 100,
        },
      },
    ];
    //When
    const output = toCUIBankAccount(input);
    //Then
    const expected : CitizenBankAccount[] = [
      {
        typeOfAccount: BankAccountTypeValues.CURRENT_ACCOUNT,
        joint: 'true',
        balance: '100',
      },
    ];
    expect(output).toEqual(expected);
  });

  it('should return undefined if Bank Account value is undefined', () => {
    //Given
    const input : CCDBankAccount[] = [
      {
        id: '1',
        value: {
          accountType: undefined,
          jointAccount: undefined,
          balance: undefined,
        },
      },
    ];
    //When
    const output = toCUIBankAccount(input);
    //Then
    const expected : CitizenBankAccount[] = [
      {
        typeOfAccount: undefined,
        joint: undefined,
        balance: undefined,
      },
    ];
    expect(output).toEqual(expected);
  });

  it('should return data if Bank Account type is Saving', () => {
    //Given
    const input : CCDBankAccount[] = [
      {
        id: '1',
        value: {
          accountType: CCDBankAccountType.SAVINGS,
          jointAccount: undefined,
          balance: undefined,
        },
      },
    ];
    //When
    const output = toCUIBankAccount(input);
    //Then
    const expected : CitizenBankAccount[] = [
      {
        typeOfAccount: BankAccountTypeValues.SAVINGS_ACCOUNT,
        joint: undefined,
        balance: undefined,
      },
    ];
    expect(output).toEqual(expected);
  });

  it('should return data if Bank Account type is ISA', () => {
    //Given
    const input : CCDBankAccount[] = [
      {
        id: '1',
        value: {
          accountType: CCDBankAccountType.ISA,
          jointAccount: undefined,
          balance: undefined,
        },
      },
    ];
    //When
    const output = toCUIBankAccount(input);
    //Then
    const expected : CitizenBankAccount[] = [
      {
        typeOfAccount: BankAccountTypeValues.ISA,
        joint: undefined,
        balance: undefined,
      },
    ];
    expect(output).toEqual(expected);
  });

  it('should return data if Bank Account type is Other', () => {
    //Given
    const input : CCDBankAccount[] = [
      {
        id: '1',
        value: {
          accountType: CCDBankAccountType.OTHER,
          jointAccount: undefined,
          balance: undefined,
        },
      },
    ];
    //When
    const output = toCUIBankAccount(input);
    //Then
    const expected : CitizenBankAccount[] = [
      {
        typeOfAccount: BankAccountTypeValues.OTHER,
        joint: undefined,
        balance: undefined,
      },
    ];
    expect(output).toEqual(expected);
  });

  it('should return data if Bank Account type is not joint', () => {
    //Given
    const input : CCDBankAccount[] = [
      {
        id: '1',
        value: {
          accountType: undefined,
          jointAccount: YesNoUpperCamelCase.NO,
          balance: undefined,
        },
      },
    ];
    //When
    const output = toCUIBankAccount(input);
    //Then
    const expected : CitizenBankAccount[] = [
      {
        typeOfAccount: undefined,
        joint: 'false',
        balance: undefined,
      },
    ];
    expect(output).toEqual(expected);
  });

});
