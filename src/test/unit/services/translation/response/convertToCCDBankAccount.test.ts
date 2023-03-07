import { CitizenBankAccount } from 'common/models/citizenBankAccount';
import {toCCDBankAccountList} from 'services/translation/response/convertToCCDBankAccount';
import {CCDBankAccount, CCDBankAccountType} from 'models/ccdResponse/ccdBankAccount';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate Bank Account to CCD model', () => {

  it('should return undefined if length is 0', () => {
    //Given
    const input: CitizenBankAccount[] = [];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is undefined', () => {
    //Given
    const input: CitizenBankAccount[] = undefined;
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return output if there is input', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });
});

describe('translate Bank Account to from different Bank Account Type', () => {

  it('should return Current Type', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return Saving Type', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('SAVINGS_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.SAVINGS, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return ISA Type', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('ISA', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.ISA, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return Other Type', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('OTHER', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.OTHER, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount(undefined),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: undefined, balance: NaN, jointAccount: undefined,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });
});

describe('translate Bank Account to from different joint account', () => {

  it('should return Yes', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return No', () => {
    //Given
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'false', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.NO,
      }},
    ];
    //When
    const output = toCCDBankAccountList(input);
    //Then
    expect(output).toEqual(expected);
  });
});
