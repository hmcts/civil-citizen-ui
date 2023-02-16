import { CitizenBankAccount } from 'common/models/citizenBankAccount';
import {toCCDBankAccountList} from 'services/translation/response/convertToCCDBankAccount';
import {CCDBankAccount, CCDBankAccountType} from 'models/ccdResponse/ccdBankAccount';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate Bank Account to CCD model', () => {

  it('should return undefined if length is 0', () => {
    const output = toCCDBankAccountList([]);
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is undefined', () => {
    const output = toCCDBankAccountList(undefined);
    expect(output).toBe(undefined);
  });

  it('should return output if there is input', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });
});

describe('translate Bank Account to from different Bank Account Type', () => {

  it('should return Current Type', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });

  it('should return Saving Type', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('SAVINGS_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.SAVINGS, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });

  it('should return ISA Type', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('ISA', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.ISA, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });

  it('should return Other Type', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('OTHER', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.OTHER, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });

  it('should return undefined', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount(undefined),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: undefined, balance: NaN, jointAccount: undefined,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });
});

describe('translate Bank Account to from different joint account', () => {

  it('should return Yes', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });

  it('should return No', () => {
    const input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'false', '123'),
    ];
    const expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.NO,
      }},
    ];

    const output = toCCDBankAccountList(input);
    expect(output).toEqual(expected);
  });
});
