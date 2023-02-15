import { CitizenBankAccount } from "common/models/citizenBankAccount";
import {toCCDBankAccountList} from "services/translation/response/convertToCCDBankAccount";
import {CCDBankAccount, CCDBankAccountType} from "models/ccdResponse/ccdBankAccount";
import {YesNoUpperCamelCase} from "form/models/yesNo";

describe('translate Bank Account to CCD model', () => {

  it('should return undefined if length is 0', () => {
    //input
    const output = toCCDBankAccountList([]);

    //output
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is undefined', () => {
    //input
    const output = toCCDBankAccountList(undefined);

    //output
    expect(output).toBe(undefined);
  });

  it('should return output if there is input', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123')
    ]
    let expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES
      }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });
});

describe('translate Bank Account to from different Bank Account Type', () => {

  it('should return Current Type', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123')
    ]
    let expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES
      }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });

  it('should return Saving Type', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount('SAVINGS_ACCOUNT', 'true', '123')
    ]
    let expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.SAVINGS, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES
      }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });

  it('should return ISA Type', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount('ISA', 'true', '123')
    ]
    let expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.ISA, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES
      }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });

  it('should return Other Type', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount('OTHER', 'true', '123')
    ]
    let expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.OTHER, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES
      }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });

  it('should return undefined', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount(undefined)
    ]
    let expected: CCDBankAccount[] = [
      { value: {
        accountType: undefined, balance: NaN, jointAccount: undefined
      }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });
});

describe('translate Bank Account to from different joint account', () => {

  it('should return Yes', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'true', '123')
    ]
    let expected: CCDBankAccount[] = [
      { value: {
        accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.YES
      }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });

  it('should return No', () => {
    //input
    let input: CitizenBankAccount[] = [
      new CitizenBankAccount('CURRENT_ACCOUNT', 'false', '123')
    ]
    let expected: CCDBankAccount[] = [
      { value: {
          accountType: CCDBankAccountType.CURRENT, balance: Number('123'), jointAccount: YesNoUpperCamelCase.NO
        }}
    ]
    const output = toCCDBankAccountList(input);

    //output
    expect(output).toEqual(expected);
  });
});
