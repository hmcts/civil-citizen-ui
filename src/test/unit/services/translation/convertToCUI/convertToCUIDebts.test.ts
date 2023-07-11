import {toCUIDebts} from 'services/translation/convertToCUI/convertToCUIDebts';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {Debts} from 'form/models/statementOfMeans/debts/debts';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';

describe('translate Debts to CUI model', () => {
  it('should return undefined if Debts doesnt exist', () => {
    //Given
    //When
    const output = toCUIDebts(undefined, undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Debts exist', () => {
    //Given
    const input : CCDLoanCredit[] = [
      {
        id: '1',
        value: {
          loanCardDebtDetail: 'test',
          totalOwed: 10000,
          monthlyPayment: 10000,
        },
      },
    ];
    //When
    const output = toCUIDebts(YesNoUpperCamelCase.YES, input);
    //Then
    const debtItems : DebtItems[] = [
      new DebtItems('test', '100', '100'),
    ];
    const expected = new Debts(
      YesNo.YES,
      debtItems,
    );
    expect(output).toEqual(expected);
  });

  it('should return data if Debts is No', () => {
    //Given
    const input : CCDLoanCredit[] = [
      {
        id: '1',
        value: undefined,
      },
    ];
    //When
    const output = toCUIDebts(YesNoUpperCamelCase.NO, input);
    //Then
    const debtItems : DebtItems[] = [
      new DebtItems(undefined, undefined, undefined),
    ];
    const expected = new Debts(
      YesNo.NO,
      debtItems,
    );
    expect(output).toEqual(expected);
  });

  it('should return data if Debts is undefined', () => {
    //Given
    const input : CCDLoanCredit[] = [
      {
        id: '1',
        value: {
          loanCardDebtDetail: undefined,
          totalOwed: undefined,
          monthlyPayment: undefined,
        },
      },
    ];
    //When
    const output = toCUIDebts(YesNoUpperCamelCase.NO, input);
    //Then
    const debtItems : DebtItems[] = [
      new DebtItems(undefined, undefined, undefined),
    ];
    const expected = new Debts(
      YesNo.NO,
      debtItems,
    );
    expect(output).toEqual(expected);
  });

  it('should return data if Debts value is undefined', () => {
    //Given
    const input : CCDLoanCredit[] = [
      {
        id: '1',
        value: undefined,
      },
    ];
    //When
    const output = toCUIDebts(YesNoUpperCamelCase.NO, input);
    //Then
    const debtItems : DebtItems[] = [
      new DebtItems(undefined, undefined, undefined),
    ];
    const expected = new Debts(
      YesNo.NO,
      debtItems,
    );
    expect(output).toEqual(expected);
  });

  it('should return data if Debts value is undefined', () => {
    //Given
    //When
    const output = toCUIDebts(YesNoUpperCamelCase.NO, undefined);
    //Then
    const expected = new Debts(
      YesNo.NO,
      undefined,
    );
    expect(output).toEqual(expected);
  });
});
